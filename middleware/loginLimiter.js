const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

const loginLimiter = rateLimit({
  // 1 minute (60x 1000 milliseconds)
  windowMs: 60 * 1000,
  // Limit each IP to 5 login requests per "window" per minute
  max: 5,
  // message if limit is exceeded
  message: {
    message: "Too many login attempts from this IP, please wait 60 seconds.",
  },
  // handles if limit is achieved
  handler: (req, res, next, options) => {
    // gets written to error log
    logEvents(
      `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errLog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  // return rate limit info in rate limit headers - recommended in documentation
  standardHeaders: true,
  // Disable x-ratelimit headers - recommended in documentation
  legacyHeaders: false,
});

module.exports = loginLimiter;
