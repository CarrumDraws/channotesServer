const express = require("express");
const pool = require("../db");
const supabase = require("../supabase.js");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Gets Data of a User + Friends Num
router.get("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    if (!chan_id)
      return res.status(400).send({ response: "Missing Parameters" });

    let user = await supabase.rpc("getuser", {
      chan_id_input: chan_id,
    });
    if (user.error) throw error;
    user = user.data[0];
    delete user.google_id;
    res.send(user);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Gets List of Friends
router.get("/friends", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;

    // let user = await pool.query(
    //   "SELECT users.chan_id, users.first_name, users.last_name, users.username, users.email, users.image FROM users RIGHT JOIN friends ON users.chan_id = friends.chan_id_a WHERE friends.chan_id_b = ($1);",
    //   [chan_id]
    // );
    let user = await supabase
      .from("users")
      .select(
        `chan_id, first_name, last_name, username, email, image, friends (chan_id_a)`
      )
      .eq("friends.chan_id_b", chan_id);

    console.log(user);
    res.send(user.data);
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
    if (!user_id)
      return res.status(400).send({ response: "Missing Parameters" });
    if (chan_id == user_id)
      return res.status(400).send({ response: "Repeated Parameters" });

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
      res.send({ response: "New Friend" });
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
      res.send({ response: "Unfriended" });
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
      "SELECT users.chan_id, users.first_name, users.last_name, users.username, users.email, users.image FROM users LEFT JOIN blocks ON users.chan_id = blocks.chan_id_a WHERE blocks.chan_id = ($1);",
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
    if (!user_id)
      return res.status(400).send({ response: "Missing Parameters" });
    if (chan_id == user_id)
      return res.status(400).send({ response: "Repeated Parameters" });

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
      res.send({ response: "Blocked" });
    } else {
      // UnBlock :)
      await pool.query(
        "DELETE FROM blocks WHERE chan_id = ($1) AND chan_id_a = ($2);",
        [chan_id, user_id]
      );
      res.send({ response: "UnBlocked" });
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
    if (!str) return res.status(400).send({ response: "Missing Parameters" });
    str += "%";
    let users = await pool.query(
      "SELECT users.chan_id, users.first_name, users.last_name, users.username, users.email, users.image FROM users WHERE UPPER(users.username) LIKE UPPER(($1));",
      [str]
    );
    res.send(users.rows);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

module.exports = router;
