const express = require("express");
const pool = require("../db");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Gets Data of a User + Friends Num
router.get("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    if (!chan_id) return res.status(400).send("Missing Parameters");

    let user = await pool.query(
      "SELECT users.*, COUNT(friends.*) AS friends FROM users LEFT JOIN friends ON users.chan_id = friends.chan_id_a WHERE users.chan_id = ($1) GROUP BY users.chan_id;",
      [chan_id]
    );

    res.send(user.rows[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Sets User Data
router.put("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let { first_name, last_name, username, email, url } = req.body;

    if (!first_name || !last_name || !username || !email || !url)
      return res.status(400).send("Missing Parameters");

    // Update User
    let user = await pool.query(
      "UPDATE users SET first_name = ($1), last_name = ($2), username = ($3), email = ($4), url = ($5) WHERE chan_id = ($6) RETURNING *;",
      [first_name, last_name, username, email, url, chan_id]
    );
    delete user.rows[0].google_id;
    res.send(user.rows[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Gets List of Friends
router.get("/friends", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;

    let user = await pool.query(
      "SELECT users.chan_id, users.first_name, users.last_name, users.username, users.email, users.url FROM users RIGHT JOIN friends ON users.chan_id = friends.chan_id_a WHERE friends.chan_id_b = ($1);",
      [chan_id]
    );
    res.send(user.rows);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Edits Friend: Friends/Unfriends
router.put("/friends", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let { user_id } = req.body;
    if (!user_id) return res.status(400).send("Missing Parameters");
    if (chan_id == user_id) return res.status(400).send("Repeated Parameters");

    // Checks friends table to see if pair is inside
    let link = await pool.query(
      "SELECT * FROM friends WHERE chan_id_a = ($1) AND chan_id_b = ($2);",
      [chan_id, user_id]
    );
    link = link.rows;

    if (link.length == 0) {
      // Make Friends :)
      await pool.query(
        "INSERT INTO friends (chan_id_a, chan_id_b) VALUES (($1), ($2));",
        [chan_id, user_id]
      );
      await pool.query(
        "INSERT INTO friends (chan_id_a, chan_id_b) VALUES (($1), ($2));",
        [user_id, chan_id]
      );
      res.send("New Friend");
    } else {
      // End Friends :(
      await pool.query(
        "DELETE FROM friends WHERE chan_id_a = ($1) AND chan_id_b = ($2);",
        [chan_id, user_id]
      );
      await pool.query(
        "DELETE FROM friends WHERE chan_id_a = ($1) AND chan_id_b = ($2);",
        [user_id, chan_id]
      );
      res.send("Unfriended");
    }
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Gets List of Blocks
router.get("/blocks", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;

    let user = await pool.query(
      "SELECT users.chan_id, users.first_name, users.last_name, users.username, users.email, users.url FROM users LEFT JOIN blocks ON users.chan_id = blocks.chan_id_a WHERE blocks.chan_id = ($1);",
      [chan_id]
    );
    res.send(user.rows);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Edits Blocked: Blocks/Unblocks
router.put("/blocks", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let { user_id } = req.body;
    if (!user_id) return res.status(400).send("Missing Parameters");
    if (chan_id == user_id) return res.status(400).send("Repeated Parameters");

    // Checks blocks table to see if pair is inside
    let link = await pool.query(
      "SELECT * FROM blocks WHERE chan_id = ($1) AND chan_id_a = ($2);",
      [chan_id, user_id]
    );
    link = link.rows;

    if (link.length == 0) {
      // Block :(
      await pool.query(
        "INSERT INTO blocks (chan_id, chan_id_a) VALUES (($1), ($2));",
        [chan_id, user_id]
      );
      // Remove Friend
      await pool.query(
        "DELETE FROM friends WHERE chan_id_a = ($1) AND chan_id_b = ($2);",
        [chan_id, user_id]
      );
      await pool.query(
        "DELETE FROM friends WHERE chan_id_a = ($1) AND chan_id_b = ($2);",
        [user_id, chan_id]
      );
      res.send("Blocked");
    } else {
      // UnBlock :)
      await pool.query(
        "DELETE FROM blocks WHERE chan_id = ($1) AND chan_id_a = ($2);",
        [chan_id, user_id]
      );
      res.send("Unblocked");
    }
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Queries: name
router.get("/search", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let str = req.query.search;
    if (!str) return res.status(400).send("Missing Data");
    str += "%";
    let users = await pool.query(
      "SELECT users.chan_id, users.first_name, users.last_name, users.username, users.email, users.url FROM users WHERE UPPER(users.username) LIKE UPPER(($1));",
      [str]
    );
    res.send(users.rows);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

module.exports = router;
