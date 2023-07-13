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
    if (!folder_id) res.status(400).json({ msg: "folderId does not exist." });

    // Find Child Folders
    let folders = await pool.query(
      "SELECT * FROM folders WHERE folder_id = ($1);",
      [folder_id]
    );

    for (let folder of folders.rows) {
      delete folder.chan_id;
    }
    res.send(folders.rows);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

// Create New Folder w/ folder_id and title.
// If !folder_id then put in Home Folder.
router.post("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let { folder_id, title } = req.body;

    // If no folder_id, get ID of Home Folder
    if (!folder_id) {
      folder_id = await pool.query(
        "SELECT * FROM folders WHERE folder_id IS NULL AND chan_id = ($1);",
        [chan_id]
      );
      folder_id = folder_id.rows[0].id;
    }
    if (!folder_id) res.status(400).json({ msg: "folder_id does not exist." });

    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let folder = await pool.query(
      "INSERT INTO folders (chan_id, folder_id, title, date_created, date_accessed) VALUES (($1), ($2), ($3), ($4), ($5)) RETURNING *;",
      [chan_id, folder_id, title, time, time]
    );

    delete folder.rows[0].chan_id;
    res.send(folder.rows[0]);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

// Rename/Move a Folder
router.put("/:folderid", (req, res) => {
  console.log("editFolder");
});

router.delete("/:folderid", (req, res) => {
  console.log("deleteFolder");
});

module.exports = router;
