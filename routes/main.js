const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

router.get("/", (req, res) => {
  const quoteoftheday = [
    "It's real sweat. I'm a high performance athlete. Athletes sweat. Sweat baby! Ki ki ki ra, sweat sweat, hu hu! - Daniel Ricciardo",
    "I drive fast. I drink coffee. Leave me alone. Sometimes at the same time. - Kimi Räikkönen",
    "I brake late, I overtake early… life advice included. - Max Verstappen",
    "I push the car as hard as I push my laundry into the washing machine. Very, very fast. - Sebastian Vettel",
    "If you’re not first, you’re probably napping. Or eating spaghetti. Or both. - Usain Bolt",
    "I don’t always dunk… but when I do, the whole city feels it, and sometimes the neighbors. - Shaquille O’Neal",
    "I train like a beast, I fight like a lion… and I nap like a kitten. Sometimes in the ring. - Conor McGregor",
    "I rebound in basketball and in life… sometimes with sunglasses at night, always with style. - Dennis Rodman",
    "I can accept failure… but I cannot accept someone touching my sandwich. - Michael Jordan",
    "I race fast, I party hard, I smile harder. Sweat, laughter, repeat! - Daniel Ricciardo",
  ];

  const randomquote =
    quoteoftheday[Math.floor(Math.random() * quoteoftheday.length)];

  res.render("home.ejs", {
    quote: randomquote,
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
  const user_id = req.session.user?.user_id || 0;

  // Display full weekly schedule
  let sql = `
    SELECT s.schedule_id, c.name, c.duration_minutes, s.day_of_week, s.start_time,
           b.booking_id
    FROM class_schedule s
    JOIN classes c ON s.class_id = c.class_id
    LEFT JOIN bookings b 
           ON s.schedule_id = b.schedule_id AND b.user_id = ${user_id}
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
    if (err) return next(err);

    res.render("classes.ejs", {
      classes: result,
      user: req.session.user,
      searchclasses,
    });
  });
});

router.post("/book", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const user_id = req.session.user.user_id;
  const schedule_id = req.body.schedule_id;

  const sql = `
  INSERT INTO bookings (user_id, schedule_id) VALUES (?, ?)
  `;

  db.query(sql, [user_id, schedule_id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.send("You have already booked this class - how lucky!");
      }
      return next(err);
    }
    res.redirect("/classes");
  });
});

router.post("/cancel", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const user_id = req.session.user.user_id;
  const schedule_id = req.body.schedule_id;

  const sql = `
  DELETE FROM bookings WHERE user_id = ? AND schedule_id = ?
  `;

  db.query(sql, [user_id, schedule_id], (err, result) => {
    if (err) return next(err);
    if (result.affectedRows === 0) {
      return res.send("You have not booked this class!");
    }
    res.redirect("/classes");
  });
});

router.get("/bookings", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const sql = `
    SELECT c.name, s.day_of_week, s.start_time, c.duration_minutes
    FROM bookings b
    JOIN class_schedule s ON b.schedule_id = s.schedule_id
    JOIN classes c ON s.class_id = c.class_id
    WHERE b.user_id = ?
    ORDER BY FIELD(s.day_of_week, 
      'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
    ), s.start_time
  `;

  db.query(sql, [req.session.user.user_id], (err, results) => {
    if (err) return next(err);

    res.render("bookings.ejs", {
      bookings: results,
      user: req.session.user,
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

router.post(
  "/contactus",
  [check("email").isEmail().withMessage("Invalid Email!")],
  (req, res, next) => {
    const name = req.sanitize(req.body.name);
    const email = req.sanitize(req.body.email);
    const message = req.sanitize(req.body.message);

    const sql = `
    INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)
  `;

    const newRecord = [name, email, message];

    db.query(sql, newRecord, (err, result) => {
      if (err) return next(err);

      res.render("contactus.ejs", {
        submitted: true,
        name,
        email,
        message,
      });
    });
  }
);

router.get("/login", (req, res) => {
  res.render("login.ejs", {
    errors: [],
  });
});

router.post(
  "/login",
  [
    check("username").notEmpty().withMessage("Username required"),
    check("password").notEmpty().withMessage("Password required"),
  ],
  (req, res, next) => {
    const username = req.sanitize(req.body.username);
    const password = req.sanitize(req.body.password);

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
            user_id: user.user_id,
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

    const forename = req.sanitize(req.body.forename);
    const surname = req.sanitize(req.body.surname);
    const email = req.sanitize(req.body.email);
    const username = req.sanitize(req.body.username);
    const password = req.body.password;

    const saltrounds = 10;

    bcrypt.hash(password, saltrounds, function (err, hashedpassword) {
      if (err) return next(err);

      const sql = `
            INSERT INTO users (forename, surname, email, username, hashedpassword) values (?, ?, ?, ?, ?)
          `;
      const newrecord = [forename, surname, email, username, hashedpassword];

      db.query(sql, newrecord, (err, result) => {
        if (err) {
          return next(err);
        }

        res.render("signup.ejs", {
          submitted: true,
          errors: [],
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
    res.render("login.ejs", { errors: [] });
  });
});

module.exports = router;