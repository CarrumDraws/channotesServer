import authRoutes from "./routes/auth.js";
import folderRoutes from "./routes/folders.js";
import noteRoutes from "./routes/notes.js";
import userRoutes from "./routes/users.js";

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// MIDDLEWARE -----
app.use(express.json()); // Allows access to req.body
app.use(cors()); // Allows different-domain app interaction
app.use(bodyParser.json()); // Parse the JSON request body
dotenv.config(); // Reading .env files

app.use("/auth", authRoutes);
app.use("/folders", folderRoutes);
app.use("/notes", noteRoutes);
app.use("/users", userRoutes);

app.listen(3000, () => console.log("server started"));
