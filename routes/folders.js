const express = require("express");
const supabase = require("../supabase.js");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Gets Folder Data + Nested Folders. If no ':folderid,' use Homepage Folder.
router.get("/", verifyToken, async (req, res) => {
  try {
    const { chan_id } = req.user;
    let { folder_id } = req.query;
    if (!chan_id) return res.status(400).json({ error: "Missing Parameters" });

    // Gets All Folders
    let { data, error } = await supabase.rpc("getfolders", {
      chan_id_input: chan_id,
    });
    if (error) throw new Error(error.message);

    // Format Data
    let hash = {};
    let folder; // Target folder
    for (let i = 0; i < data.length; i++) {
      if (data[i].id == folder_id) folder = data[i];
      if (!hash[data[i].id]) hash[data[i].id] = [];
      if (!hash[data[i].folder_id]) hash[data[i].folder_id] = [];
      data[i].folders = hash[data[i].id];
      hash[data[i].folder_id].push(data[i]);
    }
    if (folder_id) {
      if (folder) res.send(folder);
      else throw new Error("Invalid chan_id");
    } else res.send(hash["null"][0]);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Create New Folder w/ folder_id and title.
// folder_id can be null.
router.post("/", verifyToken, async (req, res) => {
  try {
    const { chan_id } = req.user;
    let { folder_id, title } = req.body;
    if (!folder_id) folder_id = null;
    if (!title) return res.status(400).send({ response: "Missing Parameters" });

    const { error, data } = await supabase.rpc("newfolder", {
      chan_id_input: chan_id,
      folder_id_input: folder_id,
      title_input: title,
    });
    if (error) throw new Error(error.message);
    const folder = data?.[0];
    if (!folder) throw new Error("Folder Creation Error");
    return res.json(folder);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Rename/Move a Folder w/ folder_id, title and parent_id

router.put("/", verifyToken, async (req, res) => {
  try {
    const { chan_id } = req.user;
    const { folder_id } = req.query;
    let { title, parent_id } = req.body;
    if (!chan_id || !folder_id || !title || !parent_id)
      return res.status(400).json({ error: "Missing Parameters" });

    // Edit Folder
    let { data, error } = await supabase.rpc("editfolder", {
      chan_id_input: chan_id,
      folder_id_input: folder_id,
      parent_id_input: parent_id,
      title_input: title,
    });
    if (error) throw new Error(error.message);
    const folder = data?.[0];
    if (!folder) throw new Error("Folder Not Found");
    return res.json(folder);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Delete Folder w/ folder_id
router.delete("/", verifyToken, async (req, res) => {
  try {
    const { chan_id } = req.user;
    const { folder_id } = req.query;
    if (!folder_id)
      return res.status(400).send({ response: "Missing Parameters" });

    let { data, error } = await supabase.rpc("deletefolder", {
      chan_id_input: chan_id,
      folder_id_input: folder_id,
    });
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Folder Not Found");
    return res.json({ response: "Success" });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

module.exports = router;
