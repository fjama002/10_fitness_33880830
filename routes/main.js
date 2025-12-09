const express = require("express");
const router = express.Router();

const shopData = {
    shopName: "Health & Fitness"
}

router.get("/", (req, res) => {
    res.render("home.ejs", shopData)
})

router.get("/gyms", (req, res) => {
    res.render("gyms.ejs", shopData)
})

router.get("/classes", (req, res) => {
    res.render("classes.ejs", shopData)
})

router.get("/aboutus", (req, res) => {
    res.render("aboutus.ejs", shopData)
})

router.get("/contactus", (req, res) => {
    res.render("contactus.ejs", shopData)
})

router.get("/login", (req, res) => {
    res.render("login.ejs", shopData)
})

module.exports = router;