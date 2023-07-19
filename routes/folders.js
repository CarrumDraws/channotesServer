const express = require("express");
const pool = require("../db");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Gets Homepage/Nested Folders. If no ':folderid,' get homepage folders.
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

    // Find Child Folders
    let folders = await pool.query(
      "SELECT folders.*, COUNT(notes.*) AS notes FROM folders LEFT JOIN notes ON folders.id = notes.folder_id WHERE folders.folder_id = ($1) GROUP BY folders.id;",
      [folder_id]
    );

    // for (let folder of folders.rows) {
    //   delete folder.chan_id;
    // }
    res.send(folders.rows);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Create New Folder w/ folder_id and title.
// If !folder_id then put in Home Folder.
router.post("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let { folder_id, title } = req.body;
    if (!title) return res.status(400).send("Missing Parameters");

    if (!folder_id) {
      folder_id = await pool.query(
        "SELECT * FROM folders WHERE folder_id IS NULL AND chan_id = ($1);",
        [chan_id]
      );
      folder_id = folder_id.rows[0].id;
    }

    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let folder = await pool.query(
      "INSERT INTO folders (chan_id, folder_id, title, date_created) VALUES (($1), ($2), ($3), ($4)) RETURNING *;",
      [chan_id, folder_id, title, time]
    );

    // delete folder.rows[0].chan_id;
    res.send(folder.rows[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Rename/Move a Folder w/ folder_id, title and parent_id
router.put("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let folder_id = req.query.folder_id;
    let { title, parent_id } = req.body;

    if (!folder_id || !title || !parent_id)
      return res.status(400).send("Missing Data");

    let folder = await pool.query(
      "UPDATE folders SET title = ($1), folder_id = ($2) WHERE id = ($3) AND chan_id = ($4) RETURNING *;",
      [title, parent_id, folder_id, chan_id]
    );

    // delete folder.rows[0].chan_id;
    res.send(folder.rows[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Delete Folder w/ folder_id
router.delete("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let folder_id = req.query.folder_id;
    if (!folder_id) return res.status(400).send("Missing Data");

    await pool.query(
      "DELETE FROM folders WHERE id = ($1) AND chan_id = ($2);",
      [folder_id, chan_id]
    );
    res.send("Success");
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

module.exports = router;
