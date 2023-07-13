const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Takes in data, bcrypt's google_id, Saves to Postgre
// Returns JWT + User Data using google_id
// Also creates "Folders" Folder using your chanID.

// Note: Treats google_id like a password (bcrypts google_id)...
// ...and treats email like a username.
router.post(
  "/signup",
  async (req, res, next) => {
    try {
      const { google_id, first_name, last_name, username, email, url } =
        req.body;

      // bcrypt google_id
      const salt = await bcrypt.genSalt();
      const googleHash = await bcrypt.hash(google_id, salt);

      // Save User to Postgre
      let user = await pool.query(
        "INSERT INTO users (google_id, first_name, last_name, username, email, url) VALUES (($1), ($2), ($3), ($4), ($5), ($6)) RETURNING *;",
        [googleHash, first_name, last_name, username, email, url]
      );
      user = user.rows[0];
      req.query = { google_id: google_id, email: user.email }; // Store User in query for returnJWT()

      // Create Homepage Folder
      let date = new Date();
      let time = date.toISOString().slice(0, 19).replace("T", " ");
      let folder = await pool.query(
        "INSERT INTO folders (user_id, folder_id, title, date_created, date_accessed) VALUES (($1), ($2), ($3), ($4), ($5)) RETURNING *;",
        [user.chan_id, null, "Your Folders", time, time]
      );

      next();
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  },
  returnJWT
);

// Validates google_id + email + Returns JWT of chanID
// If no user found, returns nothing.
router.get("/hasuser", returnJWT);

async function returnJWT(req, res) {
  try {
    const { email, google_id } = req.query;
    let user = await pool.query("SELECT * FROM users WHERE email = ($1);", [
      email,
    ]);
    if (!user) res.status(400).json({ msg: "User does not exist." });

    user = user.rows[0];
    const isMatch = await bcrypt.compare(google_id, user.google_id);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ chan_id: user.chan_id }, process.env.JWT_SECRET);
    delete user.google_id;
    res.status(200).json({ token, user });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

module.exports = router;
