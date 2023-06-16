import express from "express";
import {
  homeNotes,
  sharedNotes,
  sharedFriendNotes,
  folderNotes,
  newNote,
  editNote,
  editNoteMeta,
  deleteNote,
} from "../controllers/notes.js";

const router = express.Router();

router.get("/notes/:userid", homeNotes);
router.get("/notes/:userid/shared", sharedNotes);
router.get("/notes/:userid/shared/:friendid", sharedFriendNotes);
router.get("/notes/:userid/:folderid", folderNotes);
router.post("/notes", newNote);
router.post("/notes/:noteid", editNote);
router.put("/notes/:noteid", editNoteMeta); // Edit Note MetaData (move, pin, password, lock, color, collab)
router.delete("/notes/:noteid", deleteNote);

export default router;
