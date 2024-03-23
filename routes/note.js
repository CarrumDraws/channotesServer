const express = require("express");
const supabase = require("../supabase.js");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Create New Note w/ folder_id
// If !folder_id then put in Home Folder.
router.post("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let { folder_id } = req.body;

    // If no folder_id, get ID of your Home Folder
    if (!folder_id) {
      let { error, data } = await supabase.rpc("getfolderhome", {
        chan_id_input: chan_id,
      });
      if (error) throw new Error(error.message); // Invalid Input
      folder_id = data[0].id;
    }

    // Insert New Note in Folder
    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let { error, data } = await supabase.rpc("newnote", {
      chan_id_input: chan_id,
      folder_id_input: folder_id,
      title_input: "New Note",
      time_input: time,
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
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
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
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;

    let { folder_id, pinned, locked, password } = req.body;
    console.log("Pinned is " + pinned);
    if (
      !note_id ||
      !folder_id ||
      pinned == null ||
      locked == null ||
      password == null
    )
      return res.status(400).send({ response: "Missing Parameters" });
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
    if (!note) throw new Error("Note Not Found");
    return res.json(note);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Edits notetext (title, subtext, text, date_accessed)
router.put("/text", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    let { title, subtext, text } = req.body;
    if (
      !chan_id ||
      !note_id ||
      title == null ||
      subtext == null ||
      text == null
    )
      return res.status(400).json({ error: "Missing Parameters" });

    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let { error, data } = await supabase.rpc("editnotetext", {
      chan_id_input: chan_id,
      note_id_input: note_id,
      title_input: title,
      subtext_input: subtext,
      text_input: text,
      time_input: time,
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
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    if (!note_id)
      return res.status(400).send({ response: "Missing Parameters" });
    let { error, data } = await supabase.rpc("deletenote", {
      chan_id_input: chan_id,
      note_id_input: note_id,
    });
    if (error) throw new Error(error.message); // Invalid Input
    res.send({ response: "Success" });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

module.exports = router;
