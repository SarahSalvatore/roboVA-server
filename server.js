const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 8080;

// static files found in public folder
app.use("/", express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
