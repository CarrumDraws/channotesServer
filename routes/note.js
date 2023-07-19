const express = require("express");
const pool = require("../db");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Gets Text of Specific Note
router.get("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    if (!note_id) return res.status(400).send("Missing Parameters");

    let note = await pool.query(
      "SELECT id, title, date_edited, text FROM notes WHERE chan_id = ($1) AND id = ($2);",
      [chan_id, note_id]
    );

    res.send(note.rows[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Create New Note w/ folder_id
// If !folder_id then put in Home Folder.
// Adds +1 to folder_id's 'notes' val
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

    // Insert New Note in Folder
    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let note = await pool.query(
      "INSERT INTO notes (chan_id, folder_id, title, date_created, date_edited) VALUES (($1), ($2), ($3), ($4), ($5)) RETURNING *;",
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
    if (!note_id || !title) return res.status(400).send("Missing Parameters");

    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let note = await pool.query(
      "UPDATE notes SET title = ($1), text = ($2), date_edited = ($3) WHERE chan_id = ($4) AND id = ($5) RETURNING *;",
      [title, text, time, chan_id, note_id]
    );

    // delete note.rows[0].chan_id;
    res.send(note.rows[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Gets Metadata (folder_id, pinned, locked, password, font_color, background_color)
router.get("/meta", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    if (!note_id) return res.status(400).send("Missing Parameters");

    let note = await pool.query(
      "SELECT id, folder_id, pinned, locked, password, font_color, background_color FROM notes WHERE chan_id = ($1) AND id = ($2);",
      [chan_id, note_id]
    );

    console.log(note);
    res.send(note.rows[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Edit Note MetaData (move(folder_id), pinned, locked, password, font_color, background_color)
router.put("/meta", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;

    let { folder_id, pinned, locked, password, font_color, background_color } =
      req.body;
    if (
      !note_id ||
      !folder_id ||
      !pinned ||
      !locked ||
      !password ||
      !font_color ||
      !background_color
    )
      return res.status(400).send("Missing Parameters");

    // Update Note
    let note = await pool.query(
      "UPDATE notes SET folder_id = ($1), pinned = ($2), locked = ($3), password = ($4), font_color = ($5), background_color = ($6) WHERE chan_id = ($7) AND id = ($8) RETURNING id, folder_id, pinned, locked, password, font_color, background_color;",
      [
        folder_id,
        pinned,
        locked,
        password,
        font_color,
        background_color,
        chan_id,
        note_id,
      ]
    );

    // delete note.rows[0].chan_id;
    res.send(note.rows[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Delete Note = Subtract 1 from parentFolders's count
router.delete("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    let { folder_id } = req.body;
    if (!note_id || !folder_id) return res.status(400).send("Missing Data");

    await pool.query("DELETE FROM notes WHERE id = ($1) AND chan_id = ($2);", [
      note_id,
      chan_id,
    ]);

    res.send("Success");
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

module.exports = router;
