const app = express();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

import authRoutes from "./routes/auth.js";
import folderRoutes from "./routes/folders.js";
import noteRoutes from "./routes/notes.js";
import userRoutes from "./routes/users.js";

// MIDDLEWARE -----
app.use(express.json()); // Allows access to req.body
app.use(cors()); // Allows different-domain app interaction
dotenv.config(); // Reading .env files
app.use(cors()); // Fixes CORS policy

app.use("/auth", authRoutes);
app.use("/folders", folderRoutes);
app.use("/notes", noteRoutes);
app.use("/users", userRoutes);
