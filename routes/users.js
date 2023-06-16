import express from "express";
import {
  userData,
  userFriends,
  findUser,
  updateUser,
  updateFriends,
} from "../controllers/users.js";

const router = express.Router();

router.get("/users/:userid", userData);
router.get("/users/:userid/friends", userFriends);
router.get("/users/search", findUser); // Queries: name
router.post("/users/:userid", updateUser);
router.put("/users/:userid/:friendid", updateFriends); // Queries: friend, block

export default router;
