const express = require("express");
const supabase = require("../supabase.js");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Gets Array of Notes Data for Menu Display.
// If no folder_id gets "Your Notes".
router.get("/", verifyToken, async (req, res) => {
  try {
    const { chan_id } = req.user;
    let { folder_id } = req.query;
    if (!chan_id) return res.status(400).json({ error: "Missing Parameters" });
    if (!folder_id) folder_id = null;

    // Find Notes
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
