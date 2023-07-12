const express = require("express");
const router = express.Router();

router.get("/:userid", (req, res) => {
  console.log("homeFolders");
});
router.get("/:folderid/nested", (req, res) => {
  console.log("nestedFolders");
});
router.post("/", (req, res) => {
  console.log("newFolder");
});
router.put("/:folderid", (req, res) => {
  console.log("editFolder");
});
router.delete("/folders/:folderid", (req, res) => {
  console.log("deleteFolder");
});

module.exports = router;
