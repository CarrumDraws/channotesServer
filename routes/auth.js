const express = require("express");
const router = express.Router();
const supabase = require("../supabase.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Validates google_id + email + Returns JWT of chanID
// If no user found, returns nothing.
router.get("/hasuser", async (req, res) => {
  try {
    const { email, google_id } = req.query;
    if (!email || !google_id) throw new Error("Missing Parameters");
    // Find User with matching email...
    let { error, data } = await supabase.rpc("hasuser", {
      email_input: email,
    });
    if (error) throw new Error(error.message); // Invalid Input
    const user = data?.[0];
    if (!user || !user.google_id) throw new Error("User Not Found"); // User Not Found

    // ...then check if it's google_id matches.
    const isMatch = bcrypt.compare(google_id, user.google_id);
    if (!isMatch) throw new Error("Invalid Google ID");
    const token = jwt.sign({ chan_id: user.chan_id }, process.env.JWT_SECRET);
    delete user.google_id;
    res.status(200).send({ token, user });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

module.exports = router;
