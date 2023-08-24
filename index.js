const authRoutes = require("./routes/auth.js");
const usersRoutes = require("./routes/users.js");
const foldersRoutes = require("./routes/folders.js");
const noteRoutes = require("./routes/note.js");
const notesRoutes = require("./routes/notes.js");
const sharesRoutes = require("./routes/shares.js");
const userRoutes = require("./routes/users.js");
const { verifyToken } = require("./middleware/auth.js");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const supabase = require("./supabase.js");

// FILE STORAGE -----
const multer = require("multer");
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
// Sets Image Directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// MIDDLEWARE -----
app.use(express.json()); // Allows access to req.body
app.use(cors()); // Allows different-domain app interaction
app.use(bodyParser.json()); // Parse the JSON request body
dotenv.config(); // Reading .env files

// FILE STORAGE EXAMPLES -----
app.post("/photo", uploads.single("photo"), function (req, res, next) {
  // .single means "One Photo with Key 'photo'"
  console.log(req.protocol + "://" + req.get("host"));
  console.log(req.file); // File Data
  res.json({ status: "Single File Recieved" });
});

app.post("/photos", uploads.array("photos"), function (req, res, next) {
  // .array means "Multiple Photos with Key 'photos'"
  console.log(req.files); // Files Data
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

    if (
      !google_id ||
      !first_name ||
      !last_name ||
      !username ||
      !email ||
      !req.file
    )
      return res.status(400).send({ response: "Missing Data" });

    // bcrypt google_id
    const salt = await bcrypt.genSalt();
    const googleHash = await bcrypt.hash(google_id, salt);

    // Save User to Supabase
    let user = await supabase.rpc("signup", {
      google_id_input: googleHash,
      first_name_input: first_name,
      last_name_input: last_name,
      username_input: username,
      email_input: email,
      image_input:
        req.protocol +
        "://" +
        req.get("host") +
        "/uploads/" +
        req.file.filename,
    });
    if (user.error) throw error; // handle errors like so
    user = user.data;

    // Create Homepage Folder
    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let folder = await supabase.rpc("signup_newfolder", {
      chan_id_input: user.chan_id,
      folder_id_input: null,
      title_input: "Your Folders",
      date_created_input: time,
    });
    if (folder.error) throw error;
    const token = jwt.sign({ chan_id: user.chan_id }, process.env.JWT_SECRET);
    delete user.google_id;
    res.status(200).send({ token, user });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

// Delete Old Profile Pic + Set New User Data + Return User Data
app.put("/users", verifyToken, uploads.single("image"), async (req, res) => {
  try {
    let chan_id = req.user.chan_id;
    let { first_name, last_name, username } = req.body;

    if (!first_name || !last_name || !username) {
      return res.status(400).send({ response: "Missing Parameters" });
    }

    // Get Old Image URL
    let image = await supabase.rpc("setuser_image", {
      chan_id_input: chan_id,
    });
    if (image.error) throw error;
    image = image.data;

    // Delete Old Image + Change URL
    if (req.file) {
      const lastPart = image.split("/").at(-1);
      fs.unlink(__dirname + "/uploads/" + lastPart, (err) => {
        if (err) {
          console.log("Image Deletion Error: ");
          console.log(err);
        }
      });
      image =
        req.protocol +
        "://" +
        req.get("host") +
        "/uploads/" +
        req.file.filename;
    }

    // Update User
    let user = await supabase.rpc("setuser", {
      first_name_input: first_name,
      last_name_input: last_name,
      username_input: username,
      image_input: image,
      chan_id_input: chan_id,
    });
    if (user.error) throw error;
    delete user.data.google_id;
    res.send(user.data);
  } catch (err) {
    console.log(err);
    return res.send(err);
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

app.listen(5000, () => console.log("Server Started at PORT 5000"));
