const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

router.get("/", (req, res) => {
  res.render("home.ejs", {
    user: req.session.user || null,
  });
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
        classes: [],
        searchclasses: searchclasses,
      });
    }

    res.render("classes.ejs", {
      classes: result,
      searchclasses: searchclasses,
    });
  });
});

router.get("/aboutus", (req, res) => {
  res.render("aboutus.ejs");
});

router.get("/contactus", (req, res) => {
  res.render("contactus.ejs", {
    submitted: false,
  });
});

router.post("/contactus", (req, res) => {
  const { name, email, message } = req.sanitize(req.body);

  res.render("contactus.ejs", {
    submitted: true,
    name,
    email,
    message,
  });
});

router.get("/login", (req, res) => {
  res.render("login.ejs", {
    errors: []
  });
});

router.post(
  "/login",
  [
    check("username").notEmpty().withMessage("Username required"),
    check("password").notEmpty().withMessage("Password required"),
  ],
  (req, res) => {
    const { username, password } = req.sanitize(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("login.ejs", {
        errors: errors.array(),
      });
    }

    db.query(
      `SELECT * FROM users WHERE username = ?`,
      [username],
      (err, results) => {
        if (err) return next(err);

        if (results.length === 0) {
          return res.render("login.ejs", {
            errors: [{ msg: "Invalid username or password!" }],
          });
        }

        const user = results[0];

        bcrypt.compare(password, user.hashedpassword, (err, match) => {
          if (err) return next(err);

          if (!match) {
            return res.render("login.ejs", {
              errors: [{ msg: "Invalid username or password!" }],
            });
          }

          req.session.user = {
            id: user.id,
            forename: user.forename,
            surname: user.surname,
          };

          res.redirect("/");
        });
      }
    );
  }
);

router.get("/signup", (req, res) => {
  res.render("signup.ejs", {
    errors: [],
    submitted: false,
  });
});

router.post(
  "/signup",
  [
    check("forename").trim().notEmpty().withMessage("Forename required!"),
    check("surname").trim().notEmpty().withMessage("Surname required!"),
    check("username").trim().notEmpty().withMessage("Username required!"),
    check("email").isEmail().withMessage("Invalid Email!"),
    check("username")
      .isLength({ min: 4, max: 20 })
      .withMessage("Username must be between 4 - 20 characters!"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters!"),
    check("confirmpassword")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords do not match!"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup.ejs", {
        submitted: false,
        errors: errors.array(),
      });
    }

    const { forename, surname, email, username } =
      req.sanitize(req.body);
    const { password, confirmpassword } =
      req.body;

    const saltrounds = 10;

    bcrypt.hash(password, saltrounds, function (err, hashedpassword) {
      if (err) return next(err);

      const sqlquery = `
            INSERT INTO users (forename, surname, email, username, hashedpassword) values (?, ?, ?, ?, ?)
          `;
      const newrecord = [forename, surname, email, username, hashedpassword];

      db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
          return next(err);
        }

        res.render("signup.ejs", {
          submitted: true,
          forename,
          surname,
          email,
        });
      });
    });
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("./");
    }
    res.send("You are now logged out. <a href=" + "./" + ">Home</a>");
  });
});

module.exports = router;