const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { roundToNearestMinutesWithOptions } = require("date-fns/fp");

// POST /auth/login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // if no username/password, send 400 status code and message
  if (!username || !password) {
    return res.status(400).json({ message: "Missing required credentials." });
  }
  // find user
  const foundUser = await Users.findOne({ username }).lean().exec();

  // if user is not found or is inactive, send 401 status code and message
  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized login attempt." });
  }

  // compare entered password with password hash on file
  const passwordMatch = await bcrypt.compare(password, foundUser.password);

  // if passwords do not match, send 401 status code and message
  if (!passwordMatch) {
    return res.status(401).json({ message: "Unauthorized login attempt." });
  }

  // create access token
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "600s",
    }
  );

  // create refresh token
  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  // Create secure cookie called jwt with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, // accessible only by web server
    secure: true, // https
    sameSite: "None", //cross-site availability
    maxAge: 24 * 60 * 60 * 1000, // expires in 1 d - same as refresh token
  });

  // send accessToken
  return res.json({ accessToken });
});

// GET /auth/refresh
const refresh = (req, res) => {
  const cookies = req.cookies;
  // if no cookie named jwt found, send 401 and message
  if (!cookies?.jwt) {
    return res
      .status(401)
      .json({ mesage: "Unauthorized refresh attempt. Please login." });
  }
  // if cookie, set to refreshToken variable and verify
  const refreshToken = cookies.jwt;
  // verify token
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    // async handler will catch errors not expected, err will detect errors with verification
    asyncHandler(async (err, decoded) => {
      // if error, send 403 and message
      if (err) {
        return res.status(403).json({ message: "Access forbidden." });
      }
      // find user with the username decoded from the cookie
      const foundUser = await Users.findOne({
        username: decoded.username,
      })
        .lean()
        .exec();

      // if no user found, send 401 and message
      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized." });
      }

      // if we have a user, create a new access token
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "600s",
        }
      );
      // send new token
      return res.json({ accessToken });
    })
  );
};

// POST /auth/logout
const logout = (req, res) => {
  const cookies = req.cookies;

  // if no cookie named jwt found, send 204 no status - sends 204 string representation as the response body.
  if (!cookies?.jwt) {
    return res.sendStatus(204); // no content
  }

  // clear cookie
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  return res.status(200).json({ message: "Cookie has been cleared." });
};

module.exports = { login, refresh, logout };
