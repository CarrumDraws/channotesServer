const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

// Validates google_id + email + Returns JWT of chanID
// If no user found, returns nothing.
router.get("/hasuser", async (req, res) => {
  try {
    const { email, google_id } = req.query;
    if (!email || !google_id) return res.status(400).send("Missing Data");

    let user = await pool.query("SELECT * FROM users WHERE email = ($1);", [
      email,
    ]);
    if (!user.rows.length) return res.status(400).json("Invalid Email");

    user = user.rows[0];
    const isMatch = await bcrypt.compare(google_id, user.google_id);
    if (!isMatch) return res.status(400).json("Invalid Google ID");

    const token = jwt.sign({ chan_id: user.chan_id }, process.env.JWT_SECRET);
    delete user.google_id;
    res.status(200).json({ token, user });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

module.exports = router;
