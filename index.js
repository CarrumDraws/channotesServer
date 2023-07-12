const authRoutes = require("./routes/auth.js");
const folderRoutes = require("./routes/folders.js");
const noteRoutes = require("./routes/notes.js");
const userRoutes = require("./routes/users.js");

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

app.listen(3000, () => console.log("Server Started at PORT 3000"));
