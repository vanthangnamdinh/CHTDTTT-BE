const express = require("express");
const app = express();
const port = 3001;
const bodyParser = require("body-parser");
const { Generic } = require("./src/router");
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

const db = require("./src/db");

// Create an anonymous function to establish the database connection.
// After the connection is established, start the server.
const { monan } = require("./src/Food");
const initApp = async () => {
  console.log("Testing the database connection..");

  // Test the connection.
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");
    /**
     * Start the web server on the specified port.
     */
  } catch (error) {
    console.error("Unable to connect to the database:", error.original);
  }
};

/**
 * Initialize the application.
 */
initApp();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/ga", Generic);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
