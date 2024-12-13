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




// const { faker } = require('@faker-js/faker');
// const mysql = require('mysql2');
// const express = require("express");
// const app = express();
// const path = require("path");
// const methodOverride = require("method-override");


// app.use(methodOverride("_method"));
// app.use(express.urlencoded({extended: true}));
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "/views"));

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     database: 'NodeWithSql',
//     password: 'Destinyisall8614@Mysql'
//   });

// // using faker
// let getRandomUser = () => {
//   return [
//     faker.string.uuid(),
//     faker.internet.username(), // before version 9.1.0, use userName()
//     faker.internet.email(),
//     faker.internet.password()
//   ];
// };

// app.get("/", (req, res) => {
//   let SqlQuery = "SELECT COUNT(*) FROM user";
//     try{
//   connection.query(SqlQuery, (err, result) =>{
//    if (err) throw err;
//    let count = result[0]["COUNT(*)"];
//    res.render("home.ejs", {count});
//   });
// } 
// catch (err) {
//    confirm.log(err);
//    res.send("error in DB");
// }
// });

// // show user id, email and username
// app.get("/users", (req, res) => {
//   let SqlQuery = "SELECT * FROM user";
//     try{
//   connection.query(SqlQuery, (err, users) =>{
//    if (err) throw err;
//    res.render("usersdata.ejs", {users});
//   });
// } 
// catch (err) {
//    confirm.log(err);
//    res.send("error in DB");
// }
// });

// //Edit route
// app.get("/user/:id/edit", (req, res) => {
//   let {id} = req.params;
//   let SqlQuery = `SELECT * FROM user WHERE id = '${id}'`;
//   try{
//     connection.query(SqlQuery, (err, result) =>{
//      if (err) throw err;
//      let user = result[0];
//      res.render("edituser.ejs", {user});
//     });
//   } 
//   catch (err) {
//      confirm.log(err);
//      res.send("error in DB");
//   }
  
// });

// //after edit request... Update DB route
// const bcrypt = require("bcrypt");
// app.patch("/user/:id", (req, res) => {
//   let { id } = req.params;
//   let { username, password } = req.body;

//   let q = `SELECT * FROM user WHERE id='${id}'`;

//   try {
//     connection.query(q, async (err, result) => {
//       if (err) throw err;

//       let user = result[0];
//       if (!user) {
//         return res.status(404).send("User not found");
//       }

//       console.log("Input password:", password); // Debugging
//       console.log("Stored hash:", user.password); // Debugging

//       // Compare the input password with the hashed password
//       const isMatch = await bcrypt.compare(password, user.password);

//       if (!isMatch) {
//         return res.send("WRONG Password entered!");
//       }

//       let q2 = `UPDATE user SET username='${username}' WHERE id='${id}'`;
//       connection.query(q2, (err, result) => {
//         if (err) throw err;
//         console.log("Updated!");
//         res.redirect("/user");
//       });
//     });
//   } catch (err) {
//     console.error(err); // Log the error for debugging
//     res.send("Some error with DB");
//   }
// });

// app.listen("8080", () => {
//   console.log("app is listening on port 8080");
// });





// try{
//   connection.query(SqlQuery, [data], (err, result) =>{
//    if (err) throw err;
//    console.log(result);
//   });
// } 
// catch (err) {
//    confirm.log(err);
// }
// connection.end();
  


//   let SqlQuery = "SHOW TABLES";


// for entering data by our own
// let SqlQuery = "INSERT INTO user (id, name, email, password) VALUES ?";
// let users = [
//     ["2", "Murtajiznaqvi", "syedmurtajiz@gmail.com", "destiny86"],
//     ["3", "syed", "syed8614@gmail.com", "isall12345"]
// ];


// using faker to enter data
// let SqlQuery = "INSERT INTO user (id, name, email, password) VALUES ?";

//  let data = [];
//  for(let i=1; i<=100; i++){
//      data.push(getRandomUser());  //pushing 100 random data
//  }

// by entering data by our own
// let getRandomUser = () => {
//     return {
//       userId: faker.string.uuid(),
//       username: faker.internet.username(), // before version 9.1.0, use userName()
//       email: faker.internet.email(),
//       password: faker.internet.password()
//     };
//   };

//show total number of users




// app.patch("/user/:id", (req, res) => {
//   let { id } = req.params;
//   let { username, password } = req.body;
//   console.log(username);
//   let q = `SELECT * FROM user WHERE id='${id}'`;

//   try {
//     connection.query(q, (err, result) => {
//       if (err) throw err;
//       let user = result[0];

//       if (user.password != password) {
//         res.send("WRONG Password entered!");
//       } else {
//         let q2 = `UPDATE user SET username='${username}' WHERE id='${id}'`;
//         connection.query(q2, (err, result) => {
//           if (err) throw err;
//           else {
//             console.log(result);
//             console.log("updated!");
//             res.redirect("/user");
//           }
//         });
//       }
//     });
//   } catch (err) {
//     res.send("some error with DB");
//   }
// });