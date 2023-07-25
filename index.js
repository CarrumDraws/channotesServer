const authRoutes = require("./routes/auth.js");
const usersRoutes = require("./routes/users.js");
const foldersRoutes = require("./routes/folders.js");
const noteRoutes = require("./routes/note.js");
const notesRoutes = require("./routes/notes.js");
const sharesRoutes = require("./routes/shares.js");
const userRoutes = require("./routes/users.js");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db.js");

const multer = require("multer");
// storage: Multer Config
const storage = multer.diskStorage({
  // destination: Directory where files are saved.
  // __dirname = C:\Users\Carrum\ReactStuff\channotes_server
  destination: (req, file, callback) => {
    callback(null, __dirname + "/uploads");
  },
  // filename: Name the files.
  filename: (req, file, callback) => {
    // Naming this way prevents file overlap!
    callback(null, Date.now() + file.originalname);
  },
});
const uploads = multer({ storage: storage });

// MIDDLEWARE -----
app.use(express.json()); // Allows access to req.body
app.use(cors()); // Allows different-domain app interaction
app.use(bodyParser.json()); // Parse the JSON request body
dotenv.config(); // Reading .env files

// FILE STORAGE EXAMPLES -----
app.post("/photo", uploads.single("single"), function (req, res, next) {
  // .single means "One Photo with Key 'single'"
  console.log(req.file); // File Data
  //   console.log(req.file.path); // File Path
  res.json({ status: "Single File Recieved" });
});

app.post("/photos", uploads.array("multiple"), function (req, res, next) {
  console.log(req.files); // File Data
  res.json({ status: "Multiple Files recieved" });
});

// ROUTES WITH IMAGE UPLOAD -----

// Takes in data, bcrypt's google_id, Saves to Postgre, returning user_data
// Also creates "Folders" Folder using your chanID.
// NOTE: Treats google_id like a password (bcrypts google_id)...
// ...and treats email like a username.
app.post("/auth/signup", uploads.single("image"), async (req, res, next) => {
  try {
    const { google_id, first_name, last_name, username, email } = req.body;

    if (!google_id || !first_name || !last_name || !username || !email)
      return res.status(400).send("Missing Data");

    // bcrypt google_id
    const salt = await bcrypt.genSalt();
    const googleHash = await bcrypt.hash(google_id, salt);

    // Save User to Postgre
    let user = await pool.query(
      "INSERT INTO users (google_id, first_name, last_name, username, email, url) VALUES (($1), ($2), ($3), ($4), ($5), ($6)) RETURNING *;",
      [googleHash, first_name, last_name, username, email, req.file.path]
    );
    user = user.rows[0];

    // Create Homepage Folder
    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    await pool.query(
      "INSERT INTO folders (chan_id, folder_id, title, date_created) VALUES (($1), ($2), ($3), ($4));",
      [user.chan_id, null, "Your Folders", time]
    );

    res.send(user);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

// ROUTES -----
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/folders", foldersRoutes);
app.use("/note", noteRoutes);
app.use("/notes", notesRoutes);
app.use("/shares", sharesRoutes);
app.use("/users", userRoutes);

app.listen(3000, () => console.log("Server Started at PORT 3000"));
