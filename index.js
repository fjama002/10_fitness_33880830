const ejs = require("ejs");
const express = require("express");
const path = require("path");

const app = express();

const port = 8000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const mainRoutes = require("./routes/main");

app.use("/", mainRoutes);

app.listen(port, () => console.log(`Server running on: ${port}`));