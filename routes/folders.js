import express from "express";
import { addFolder, editFolder } from "../controllers/folders.js";

const router = express.Router();

router.post("/", addFolder);
router.post("/:folderid", editFolder);
router.post("/:userid", editFolder);

export default router;
