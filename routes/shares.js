const express = require("express");
const supabase = require("../supabase.js");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Get ALL Notes from ALL Other Users that are shared with you
router.get("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let notes = await supabase.rpc("getsharedwithyou", {
      chan_id_input: chan_id,
    });
    if (notes.error) throw notes.error;
    res.send(notes.data);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Get YOUR notes that are shared with THIS person
router.get("/friends", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let chan_id_a = req.query.chan_id_a;
    if (!chan_id_a)
      return res.status(400).send({ response: "Missing Parameters" });

    let notes = await supabase.rpc("getsharedwithfriend", {
      chan_id_input: chan_id,
      chan_id_a_input: chan_id_a,
    });
    if (notes.error) throw notes.error;
    res.send(notes.data);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Get Array of Users that a Note is shared with (including Note Owner)
router.get("/note", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    if (!note_id)
      return res.status(400).send({ response: "Missing Parameters" });

    // Get Users
    let users = await supabase.rpc("getshares", {
      note_id_input: note_id,
    });
    if (users.error) throw users.error;
    // Get Owner of Note
    let owner = await supabase.rpc("getowner", {
      note_id_input: note_id,
    });
    if (owner.error) throw owner.error;
    users.data.unshift(owner.data[0]);
    res.send(users.data);
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
    let note = await supabase.rpc("getnote", {
      chan_id_input: chan_id,
      note_id_input: note_id,
    });
    if (note.error) throw note.error;
    if (note.data.length == 0)
      return res
        .status(400)
        .send({ response: "Unauthorized: Not the Note Owner" });

    // Checks shares table to see if pair is inside
    let link = await supabase.rpc("checkshared", {
      chan_id_a_input: chan_id_a,
      note_id_input: note_id,
    });
    if (link.error) throw link.error;
    if (link.data.length == 0) {
      // Share
      let share = await supabase.rpc("share", {
        chan_id_a_input: chan_id_a,
        note_id_input: note_id,
      });
      if (share.error) throw share.error;
      res.send({ response: "Shared" });
    } else {
      // Unshare
      let unshare = await supabase.rpc("unshare", {
        chan_id_a_input: chan_id_a,
        note_id_input: note_id,
      });
      if (unshare.error) throw unshare.error;
      res.send({ response: "UnShared" });
    }
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

module.exports = router;
