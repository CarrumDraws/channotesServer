const express = require("express");
const pool = require("../db");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Get Other Users' Notes that are being shared with
router.get("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;

    let notes = await pool.query(
      "SELECT id, title, date_edited FROM notes LEFT JOIN shares ON notes.id = shares.note_id WHERE shares.chan_id_a = ($1);",
      [chan_id]
    );

    res.send(notes.rows);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Get YOUR notes that are shared with this person
router.get("/friends", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let chan_id_a = req.query.chan_id_a;
    if (!chan_id_a)
      return res.status(400).send({ response: "Missing Parameters" });

    let notes = await pool.query(
      "SELECT id, title, date_edited FROM notes LEFT JOIN shares ON notes.id = shares.note_id WHERE notes.chan_id = ($1) AND shares.chan_id_a = ($2);",
      [chan_id, chan_id_a]
    );

    res.send(notes.rows);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Get Array of Users that a Note is shared with (including Note Owner)
router.get("/note", verifyToken, async (req, res) => {
  try {
    // let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    if (!note_id)
      return res.status(400).send({ response: "Missing Parameters" });

    let users = await pool.query(
      "SELECT chan_id, first_name, last_name, username, email, image FROM users LEFT JOIN shares ON users.chan_id = shares.chan_id_a WHERE shares.note_id = ($1);",
      [note_id]
    );
    let owner = await pool.query(
      "SELECT users.chan_id, first_name, last_name, username, email, image FROM users LEFT JOIN notes ON users.chan_id = notes.chan_id WHERE notes.id = ($1);",
      [note_id]
    );
    users.rows.unshift(owner.rows[0]);
    res.send(users.rows);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Toggles User’s Access to a Shared Note
router.put("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let { chan_id_a, note_id } = req.body;
    if (!chan_id_a || !note_id)
      return res.status(400).send({ response: "Missing Parameters" });

    // Check if note belongs to you
    let sharable = await pool.query(
      "SELECT * FROM notes WHERE chan_id = ($1) AND id = ($2);",
      [chan_id, note_id]
    );
    if (sharable.rows.length == 0)
      return res
        .status(400)
        .send({ response: "Unauthorized: Not the Note Owner" });

    // Checks shares table to see if pair is inside
    let link = await pool.query(
      "SELECT * FROM shares WHERE chan_id_a = ($1) AND note_id = ($2);",
      [chan_id_a, note_id]
    );
    link = link.rows;

    if (link.length == 0) {
      // Share
      await pool.query(
        "INSERT INTO shares (chan_id_a, note_id) VALUES (($1), ($2));",
        [chan_id_a, note_id]
      );
      res.send({ response: "Shared" });
    } else {
      // Unshare
      await pool.query(
        "DELETE FROM shares WHERE chan_id_a = ($1) AND note_id = ($2);",
        [chan_id_a, note_id]
      );
      res.send({ response: "UnShared" });
    }
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

module.exports = router;
