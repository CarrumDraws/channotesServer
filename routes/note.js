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
      let homefolder = await supabase.rpc("getfolderhome", {
        chan_id_input: chan_id,
      });
      if (homefolder.error) throw homefolder.error;
      folder_id = homefolder.data[0].id;
    }

    // Insert New Note in Folder
    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let note = await supabase.rpc("newnote", {
      chan_id_input: chan_id,
      folder_id_input: folder_id,
      title_input: "New Note",
      time_input: time,
    });
    if (note.error) throw note.error;

    // delete note.rows[0].chan_id;
    res.send(note.data[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Gets Text of Specific Note
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

// Edit a Note’s Contents + Sets Time Accessed + Renames Note
router.put("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    let { title, text } = req.body;
    if (!chan_id || !note_id || !title)
      return res.status(400).json({ error: "Missing Parameters" });

    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let { error, data } = await supabase.rpc("editnote", {
      chan_id_input: chan_id,
      note_id_input: note_id,
      text_input: text,
      title_input: title,
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

// Gets Metadata (folder_id, pinned, locked, password, font_color, background_color)
router.get("/meta", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    if (!note_id)
      return res.status(400).send({ response: "Missing Parameters" });
    let note = await supabase.rpc("getnotemeta", {
      chan_id_input: chan_id,
      note_id_input: note_id,
    });
    if (note.error) throw note.error;
    res.send(note.data[0]);
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
      return res.status(400).send({ response: "Missing Parameters" });

    // Update Note
    let note = await supabase.rpc("editnotemeta", {
      chan_id_input: chan_id,
      note_id_input: note_id,
      folder_id_input: folder_id,
      pinned_input: pinned,
      locked_input: locked,
      password_input: password,
      font_color_input: font_color,
      background_color_input: background_color,
    });
    if (note.error) throw note.error;

    // delete note.rows[0].chan_id;
    res.send(note.data[0]);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Delete Note
router.delete("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let note_id = req.query.note_id;
    if (!note_id)
      return res.status(400).send({ response: "Missing Parameters" });
    let note = await supabase.rpc("deletenote", {
      chan_id_input: chan_id,
      note_id_input: note_id,
    });
    if (note.error) throw note.error;
    res.send({ response: "Success" });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

module.exports = router;
