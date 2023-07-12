const express = require("express");
const router = express.Router();

router.get("/shared/:userid", (req, res) => {
  console.log("sharedNotes");
});
router.get("/shared/:userid/:friendid", (req, res) => {
  console.log("sharedFriendNotes");
});
router.put("/shared/:userid/:noteid", (req, res) => {
  console.log("updateShared");
});

module.exports = router;
