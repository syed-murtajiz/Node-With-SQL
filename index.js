const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'NodeWithSql',
  password: 'Destinyisall8614@Mysql'
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to the database");
});

// Helper function to generate random user data
const getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password() // Ensure this is hashed before storing
  ];
};

// Home route
app.get("/", (req, res) => {
  const SqlQuery = "SELECT COUNT(*) AS count FROM user";
  connection.query(SqlQuery, (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Error in DB");
    }
    const count = result[0].count;
    res.render("home.ejs", { count });
  });
});

// Show all users
app.get("/users", (req, res) => {
  const SqlQuery = "SELECT id, username, email FROM user";
  connection.query(SqlQuery, (err, users) => {
    if (err) {
      console.error(err);
      return res.send("Error in DB");
    }
    res.render("usersdata.ejs", { users });
  });
});

// Edit user route
app.get("/user/:id/edit", (req, res) => {
  const { id } = req.params;
  const SqlQuery = "SELECT id, username, email FROM user WHERE id = ?";
  connection.query(SqlQuery, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Error in DB");
    }
    const user = result[0];
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("edituser.ejs", { user });
  });
});

// Update user route
app.patch("/user/:id", (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  if (!password) {
    console.error("Password not provided in request body");
    return res.status(400).send("Password is required to authenticate");
  }

  const SqlQuery = "SELECT * FROM user WHERE id = ?";
  connection.query(SqlQuery, [id], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.send("Error in DB");
    }

    const user = result[0];
    if (!user) {
      console.error("User not found for ID:", id);
      return res.status(404).send("User not found");
    }

    if (!user.password) {
      console.error("No password stored in database for user:", id);
      return res.status(500).send("Password not found in database for user");
    }

    // Compare the provided password with the stored hashed password
    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr) {
        console.error("Error comparing passwords:", compareErr);
        return res.send("Error comparing passwords");
      }

      if (!isMatch) {
        console.error("Password mismatch for user:", id);
        return res.status(401).send("Authentication failed: Incorrect password");
      }

      // Update username if authentication succeeds
      const UpdateQuery = "UPDATE user SET username = ? WHERE id = ?";
      connection.query(UpdateQuery, [username, id], (updateErr) => {
        if (updateErr) {
          console.error("Error updating user:", updateErr);
          return res.send("Error updating user in DB");
        }
        console.log("User updated successfully:", id);
        res.redirect("/users");
      });
    });
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});