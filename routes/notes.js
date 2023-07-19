const express = require("express");
const pool = require("../db");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Gets Array of Notes Data for Menu Display.
// If no folder_id Gets homepage Notes.
router.get("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let folder_id = req.query.folder_id;

    // If no folder_id, get ID of your Home Folder
    if (!folder_id) {
      folder_id = await pool.query(
        "SELECT * FROM folders WHERE folder_id IS NULL AND chan_id = ($1);",
        [chan_id]
      );
      folder_id = folder_id.rows[0].id;
    }

    // Find Child Notes
    let notes = await pool.query(
      "SELECT id, title, date_created, date_edited, locked FROM notes WHERE chan_id = ($1) AND folder_id = ($2);",
      [chan_id, folder_id]
    );

    // for (let note of notes.rows) {
    //   delete note.chan_id;
    // }
    res.send(notes.rows);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

module.exports = router;
