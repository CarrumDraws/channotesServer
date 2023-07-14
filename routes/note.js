const express = require("express");
const pool = require("../db");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Gets Text of Specific Note
router.get("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;

    // Find Child Notes
    let note = await pool.query(
      "SELECT id, title, date_accessed, text FROM notes WHERE chan_id = ($1) AND id = ($2);",
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

// Create New Note w/ folder_id
// If !folder_id then put in Home Folder.
router.post("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let { folder_id } = req.body;

    // If no folder_id, use ID of your Home Folder
    if (!folder_id) {
      folder_id = await pool.query(
        "SELECT * FROM folders WHERE folder_id IS NULL AND chan_id = ($1);",
        [chan_id]
      );
      folder_id = folder_id.rows[0].id;
    }

    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let note = await pool.query(
      "INSERT INTO notes (chan_id, folder_id, title, date_created, date_accessed) VALUES (($1), ($2), ($3), ($4), ($5)) RETURNING *;",
      [chan_id, folder_id, "New Note", time, time]
    );

    // delete note.rows[0].chan_id;
    res.send(note.rows[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Edit a Note’s Contents + Sets Time Accessed + Renames Note
router.put("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    let { title, text } = req.body;

    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let note = await pool.query(
      "UPDATE notes SET title = ($1), text = ($2), date_accessed = ($3) WHERE chan_id = ($4) AND id = ($5) RETURNING *;",
      [title, text, time, chan_id, note_id]
    );

    // delete note.rows[0].chan_id;
    res.send(note.rows[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Edit Note MetaData (move, pin, password, lock, color, collab)
router.put("/meta", (req, res) => {
  console.log("editNoteMeta");
});
// Delete Note
router.delete("/", (req, res) => {
  console.log("deleteNote");
});

module.exports = router;
