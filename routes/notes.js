const express = require("express");
const router = express.Router();

router.get("/notes/:userid", (req, res) => {
  console.log("homeNotes");
});
router.get("/notes/:userid/:folderid", (req, res) => {
  console.log("folderNotes");
});
router.post("/notes", (req, res) => {
  console.log("newNote");
});
router.post("/notes/:noteid", (req, res) => {
  console.log("editNote");
});
// Edit Note MetaData (move, pin, password, lock, color, collab)
router.put("/notes/:noteid", (req, res) => {
  console.log("editNoteMeta");
});
router.delete("/notes/:noteid", (req, res) => {
  console.log("deleteNote");
});

module.exports = router;
