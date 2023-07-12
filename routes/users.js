const express = require("express");
const router = express.Router();

router.get("/users/:userid", (req, res) => {
  console.log("userData");
});
router.get("/users/:userid/friends", (req, res) => {
  console.log("userFriends");
});
// Queries: name
router.get("/users/search", (req, res) => {
  console.log("findUser");
});
router.post("/users/:userid", (req, res) => {
  console.log("updateUser");
});
// Queries: friend, block
router.put("/users/:userid/:friendid", (req, res) => {
  console.log("updateFriends");
});

module.exports = router;
