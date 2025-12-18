const express = require("express");
const router = express.Router();

const shopData = {
  shopName: "Health & Fitness",
};

router.get("/", (req, res) => {
  res.render("home.ejs", shopData);
});

router.get("/gyms", (req, res, next) => {
  const searchlocations = req.query.searchlocations;

  // Display all locations
  let sql = `
    SELECT * FROM locations
  `;

  const paramaters = [];

  // Search through locations
  if (searchlocations) {
    sql += " WHERE LOWER(city) LIKE ?";
    paramaters.push(`%${searchlocations.toLowerCase()}%`);
  }

  // Render the page with the data
  db.query(sql, paramaters, (err, result) => {
    if (err) return next(err);
    res.render("gyms.ejs", {
      shopName: shopData.shopName,
      gyms: result,
      searchlocations,
    });
  });
});

router.get("/classes", (req, res, next) => {
  const searchclasses = req.query.searchclasses;

  // Display full weekly schedule
  let sql = `
    SELECT
      c.name,
      c.duration_minutes,
      s.day_of_week,
      s.start_time
    FROM class_schedule s
    JOIN classes c ON s.class_id = c.class_id
  `;

  const paramaters = [];

  // Search through weekly schedule
  if (searchclasses) {
    sql += " WHERE LOWER(c.name) LIKE ?";
    paramaters.push(`%${searchclasses.toLowerCase()}%`);
  }

  // Ensures weekly schedule is displayed in order of time
  sql += `
    ORDER BY FIELD(s.day_of_week, 
      'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
    ),
    s.start_time
  `;

  db.query(sql, paramaters, (err, result) => {
    if (err) {
      console.error(err);
      return res.render("classes.ejs", {
        shopName: shopData.shopName,
        classes: [],
        searchclasses: searchclasses,
      });
    }

    res.render("classes.ejs", {
      shopName: shopData.shopName,
      classes: result,
      searchclasses: searchclasses,
    });
  });
});

router.get("/aboutus", (req, res) => {
  res.render("aboutus.ejs", shopData);
});

router.get("/contactus", (req, res) => {
  res.render("contactus.ejs", shopData);
});

router.get("/login", (req, res) => {
  res.render("login.ejs", shopData);
});

router.get("/signup", (req, res) => {
  res.render("signup.ejs", shopData);
});

module.exports = router;
