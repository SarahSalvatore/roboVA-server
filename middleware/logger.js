const { format } = require("date-fns");
const { nanoid } = require("nanoid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

// log events with date, time, logId and message (note: \t are tabs, \n is a new line)
const logEvents = async (message, logName) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logEntry = `${dateTime}\t${nanoid()}\t${message}\n`;

  // check if directory exists
  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logName),
      logEntry
    );
  } catch (error) {
    console.log(error);
  }
};

// write log to text file if delete operation is performed (reqLog.log) (note: \t are tabs)
const logger = (req, res, next) => {
  if (req.method === "DELETE") {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  }
  next();
};

module.exports = { logEvents, logger };
