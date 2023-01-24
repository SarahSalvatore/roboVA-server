require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/cors/corsOptions.js");
const connectDB = require("./config/dbConn.js");
const { logger, logEvents } = require("./middleware/logger.js");
const errorHandler = require("./middleware/errorHandler.js");

const PORT = process.env.PORT || 8080;

// db connection
connectDB();

// middleware to log events
app.use(logger);

// CORS setup
app.use(cors(corsOptions));

// receive and parse json data
app.use(express.json());

// parses received cookies
app.use(cookieParser());

// serves static files found in public folder
app.use("/", express.static(path.join(__dirname, "public")));

// sends static root file (index.html)
app.use("/", require("./routes/root"));

// catch-all to 404 error page
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ Error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// global error handler middleware
app.use(errorHandler);

// listens for open/successful mongo connection and app listening on PORT
mongoose.connection.once("open", () => {
  console.log("Database is connected");
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});

// listens for db connection errors and logs errors
mongoose.connection.on("error", (error) => {
  console.log(error);
  logEvents(
    `${error.no}\t${error.code}\t${error.syscall}\t${error.hostname}`,
    "dbErrorLog.log"
  );
});
