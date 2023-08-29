const express = require("express");
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
    if (user.error) throw user.error;
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
    let friends = await supabase.rpc("getfriends", {
      chan_id_input: chan_id,
    });
    console.log(friends);
    if (friends.error) throw friends.error;
    res.send(friends.data);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Edits Friend: Friends/Unfriends
// NOTE: For extra safely, should check that neither party has one another blocked...
router.put("/friends", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let { user_id } = req.body;
    if (!user_id)
      return res.status(400).send({ response: "Missing Parameters" });
    if (chan_id == user_id)
      return res.status(400).send({ response: "Repeated Parameters" });

    // Checks friends table to see if pair is inside
    let isFriend = await supabase.rpc("checkfriend", {
      chan_id_input: chan_id,
      user_id_input: user_id,
    });
    if (isFriend.error) throw isFriend.error;
    if (isFriend.data.length == 0) {
      // Make Friends :)
      let newfriend = await supabase.rpc("makefriend", {
        chan_id_a_input: chan_id,
        chan_id_b_input: user_id,
      });
      if (newfriend.error) throw newfriend.error;
      newfriend = await supabase.rpc("makefriend", {
        chan_id_a_input: user_id,
        chan_id_b_input: chan_id,
      });
      if (newfriend.error) throw newfriend.error;
      res.send({ response: "New Friend" });
    } else {
      // End Friends :(
      let oldfriend = await supabase.rpc("deletefriend", {
        chan_id_a_input: chan_id,
        chan_id_b_input: user_id,
      });
      if (oldfriend.error) throw oldfriend.error;
      oldfriend = await supabase.rpc("deletefriend", {
        chan_id_a_input: user_id,
        chan_id_b_input: chan_id,
      });
      if (oldfriend.error) throw oldfriend.error;
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

    // let block = await pool.query(
    //   "SELECT users.chan_id, users.first_name, users.last_name, users.username, users.email, users.image FROM users LEFT JOIN blocks ON users.chan_id = blocks.chan_id_a WHERE blocks.chan_id = ($1);",
    //   [chan_id]
    // );
    let block = await supabase.rpc("getblocks", {
      chan_id_input: chan_id,
    });
    console.log(block);
    res.send(block.data);
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
    let isBlocked = await supabase.rpc("checkblock", {
      chan_id_input: chan_id,
      user_id_input: user_id,
    });
    console.log(isBlocked);
    if (isBlocked.error) throw isBlocked.error;
    if (isBlocked.data.length == 0) {
      // Block :(
      let block = await supabase.rpc("block", {
        chan_id_input: chan_id,
        user_id_input: user_id,
      });
      if (block.error) throw block.error;
      // Remove Friend
      let oldfriend = await supabase.rpc("deletefriend", {
        chan_id_a_input: chan_id,
        chan_id_b_input: user_id,
      });
      if (oldfriend.error) throw oldfriend.error;
      oldfriend = await supabase.rpc("deletefriend", {
        chan_id_a_input: user_id,
        chan_id_b_input: chan_id,
      });
      if (oldfriend.error) throw oldfriend.error;
      res.send({ response: "Blocked" });
    } else {
      // UnBlock :)
      let unblock = await supabase.rpc("unblock", {
        chan_id_input: chan_id,
        user_id_input: user_id,
      });
      if (unblock.error) throw unblock.error;
      res.send({ response: "UnBlocked" });
    }
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Queries: username_search
// NOTE: Make sure blocked users are excluded!
router.get("/search", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let username = req.query.username_search;
    if (!username)
      return res.status(400).send({ response: "Missing Parameters" });
    username += "%";
    let users = await supabase.rpc("search", {
      username_input: username,
    });
    if (users.error) throw users.error;
    res.send(users.data);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

module.exports = router;
