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
    if (!chan_id) return res.status(400).json({ error: "Missing Parameters" });

    // If no folder_id, get ID of your Home Folder
    if (!folder_id) {
      let { data, error } = await supabase.rpc("getfolderhome", {
        chan_id_input: chan_id,
      });
      if (error) throw new Error(error.message);
      folder_id = data[0].id;
    }

    // Find Child Notes
    let { data, error } = await supabase.rpc("getnotes", {
      chan_id_input: chan_id,
      folder_id_input: folder_id,
    });
    if (error) throw new Error(error.message);
    res.send(data);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

module.exports = router;
