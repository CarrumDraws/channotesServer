const express = require("express");
const pool = require("../db");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

router.get("/:userid", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    if (!note_id) return res.status(400).send("Missing Parameters");

    let note = await pool.query(
      "SELECT id, title, date_edited, text FROM notes WHERE chan_id = ($1) AND id = ($2);",
      [chan_id, note_id]
    );

    // for (let note of notes.rows) {
    //   delete note.chan_id;
    // }
    res.send(note.rows[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});
router.get("/:userid/:friendid", (req, res) => {
  console.log("sharedFriendNotes");
});
router.put("/:userid/:noteid", (req, res) => {
  console.log("updateShared");
});

module.exports = router;
