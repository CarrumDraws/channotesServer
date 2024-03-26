const express = require("express");
const supabase = require("../supabase.js");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Create New Note w/ folder_id
// If !folder_id then put in special "Your Notes" Folder.
router.post("/", verifyToken, async (req, res) => {
  try {
    const { chan_id } = req.user;
    let { folder_id } = req.body;
    if (!chan_id) return res.status(400).json({ error: "Missing Parameters" });
    if (!folder_id) folder_id = null;

    // Insert New Note in Folder
    let { error, data } = await supabase.rpc("newnote", {
      chan_id_input: chan_id,
      folder_id_input: folder_id,
      title_input: "New Note",
    });
    if (error) throw new Error(error.message); // Invalid Input
    const note = data?.[0];
    if (!note) throw new Error("Note Not Created"); // User Not
    return res.json(note);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Gets All Data of Specific Note
router.get("/", verifyToken, async (req, res) => {
  try {
    const { chan_id } = req.user;
    let { note_id } = req.query;
    if (!chan_id || !note_id)
      return res.status(400).json({ error: "Missing Parameters" });

    let { error, data } = await supabase.rpc("getnote", {
      chan_id_input: chan_id,
      note_id_input: note_id,
    });
    if (error) throw new Error(error.message);
    const note = data?.[0];
    if (!note) throw new Error("Note Not Found");
    return res.json(note);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Edits notes table (metadata)
router.put("/", verifyToken, async (req, res) => {
  try {
    const { chan_id } = req.user;
    let { note_id } = req.query;
    let { folder_id, pinned, locked, password } = req.body;
    if (!note_id || !folder_id || pinned == null || locked == null)
      return res.status(400).send({ response: "Missing Parameters" });
    if (!password) password = null;
    // Update Note
    let { error, data } = await supabase.rpc("editnote", {
      chan_id_input: chan_id,
      note_id_input: note_id,
      folder_id_input: folder_id,
      pinned_input: pinned,
      locked_input: locked,
      password_input: password,
    });
    if (error) throw new Error(error.message); // Invalid Input
    const note = data?.[0];
    if (!note) throw new Error("Error Editing Note Metadata");
    return res.json(note);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Edits notetext (title, subtext, text, date_accessed)
router.put("/text", verifyToken, async (req, res) => {
  try {
    const { chan_id } = req.user;
    const { note_id } = req.query;
    let { title, text, delta } = req.body;
    if (!chan_id || !note_id || title == null || text == null || delta == null)
      return res.status(400).json({ error: "Missing Parameters" });

    let { error, data } = await supabase.rpc("editnotetext", {
      chan_id_input: chan_id,
      note_id_input: note_id,
      title_input: title,
      text_input: text,
      delta_input: delta,
    });
    if (error) throw new Error(error.message); // Invalid Input
    const note = data?.[0];
    if (!note) throw new Error("Note Not Found");
    return res.json(note);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Delete Note
router.delete("/", verifyToken, async (req, res) => {
  try {
    const { chan_id } = req.user;
    const { note_id } = req.query;
    if (!chan_id) return res.status(400).json({ error: "Missing Parameters" });
    let { error, data } = await supabase.rpc("deletenote", {
      chan_id_input: chan_id,
      note_id_input: note_id,
    });
    if (error) throw new Error(error.message); // Invalid Input
    if (!data) throw new Error("Note Not Found");
    return res.json({ response: "Success" });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

module.exports = router;
