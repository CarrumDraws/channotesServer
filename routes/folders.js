import express from "express";
import {
  homeFolders,
  nestedFolders,
  newFolder,
  editFolder,
  deleteFolder,
} from "../controllers/folders.js";

const router = express.Router();

router.get("/:userid", homeFolders);
router.get("/:folderid/nested", nestedFolders);
router.post("/", newFolder);
router.put("/:folderid", editFolder);
router.delete("/folders/:folderid", deleteFolder);

export default router;
