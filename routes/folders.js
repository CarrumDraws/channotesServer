const express = require("express");
const supabase = require("../supabase.js");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Gets Folder Data + Nested Folders. If no ':folderid,' use Homepage Folder.
router.get("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let folder_id = req.query.folder_id;
    let folderdata;

    // Get Folder Data of folder_id. If no folder_id, get ID of Home Folder
    if (!folder_id) {
      folderdata = await supabase.rpc("getfolderhome", {
        chan_id_input: chan_id,
      });
    } else {
      folderdata = await supabase.rpc("getfolder", {
        chan_id_input: chan_id,
        folder_id_input: folder_id,
      });
    }
    if (folderdata.error) throw folderdata.error;

    // Find Child Folders
    let folders = await supabase.rpc("getfolders", {
      folder_id_input: folderdata.data[0].id,
    });
    if (folders.error) throw folders.error;
    // for (let folder of folders.rows) {
    //   delete folder.chan_id;
    // }
    res.send({ folderdata: folderdata.data[0], folders: folders.data });
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
    if (!title) return res.status(400).send({ response: "Missing Parameters" });

    // If no folder_id, get ID of your Home Folder
    if (!folder_id) {
      let homefolder = await supabase.rpc("getfolderhome", {
        chan_id_input: chan_id,
      });
      if (homefolder.error) throw homefolder.error;
      folder_id = homefolder.data[0].id;
    }

    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let folder = await supabase.rpc("newfolder", {
      chan_id_input: chan_id,
      folder_id_input: folder_id,
      title_input: title,
      time_input: time,
    });
    if (folder.error) throw folder.error;
    // delete folder.rows[0].chan_id;
    res.send({ ...folder.data[0], notes: 0 });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

// Rename/Move a Folder w/ folder_id, title and parent_id
// ISSUE : Doesn't return NOTES value. Should I make another SQL call to getfolders()? Yes.
router.put("/", verifyToken, async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let folder_id = req.query.folder_id;
    let { title, parent_id } = req.body;

    if (!folder_id || !title || !parent_id)
      return res.status(400).send({ response: "Missing Parameters" });

    // Edit Folder
    let folder = await supabase.rpc("editfolder", {
      chan_id_input: chan_id,
      folder_id_input: folder_id,
      parent_id_input: parent_id,
      title_input: title,
    });
    console.log(folder);
    if (folder.error) throw folder.error;

    // Get Folder (needed for notes param)
    folder = await supabase.rpc("getfolder", {
      chan_id_input: chan_id,
      folder_id_input: folder.data[0].id,
    });
    console.log(folder);
    // delete folder.rows[0].chan_id;
    res.send(folder.data[0]);
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
    if (!folder_id)
      return res.status(400).send({ response: "Missing Parameters" });

    let folder = await supabase.rpc("deletefolder", {
      chan_id_input: chan_id,
      folder_id_input: folder_id,
    });
    console.log(folder);
    if (folder.error) throw folder.error;

    res.send({ response: "Success" });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

module.exports = router;
