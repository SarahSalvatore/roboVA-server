const express = require("express");
const app = express();
const path = require("path");
const { logger } = require("./middleware/logger.js");
const errorHandler = require("./middleware/errorHandler.js");
const PORT = process.env.PORT || 8080;

// middleware to log events
app.use(logger);

// receive and parse json data
app.use(express.json());

// serves static files found in public folder
app.use("/", express.static(path.join(__dirname, "public")));

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

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
