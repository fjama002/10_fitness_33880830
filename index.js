const ejs = require("ejs");
const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "health_fitness_app",
  password: "qwertyuiop",
  database: "health_fitness",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

global.db = db;

const app = express();

const port = 8000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const mainRoutes = require("./routes/main");

app.use("/", mainRoutes);

app.listen(port, () => console.log(`Server running on: ${port}`));
