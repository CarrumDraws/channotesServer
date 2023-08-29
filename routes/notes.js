const express = require("express");
const supabase = require("../supabase.js");
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
      let homefolder = await supabase.rpc("getfolderhome", {
        chan_id_input: chan_id,
      });
      if (homefolder.error) throw homefolder.error;
      folder_id = homefolder.data[0].id;
    }

    // Find Child Notes
    let notes = await supabase.rpc("getnotes", {
      chan_id_input: chan_id,
      folder_id_input: folder_id,
    });
    // for (let note of notes.rows) {
    //   delete note.chan_id;
    // }
    res.send(notes.data);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

module.exports = router;
