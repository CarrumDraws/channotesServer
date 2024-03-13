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
const http = require("http");
const server = http.createServer(app);
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const supabase = require("./supabase.js");

// socket.io setup -----
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// SOCKETIO -----
io.on("connection", (socket) => {
  socket.on("get-document", async (note_id) => {
    const delta = await getDocument(note_id);
    socket.join(note_id); // Join Note Room
    socket.emit("load-document", delta); // Load Note Room Data

    // Broadcast Note Room Changes
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(note_id).emit("recieve-changes", delta); // Send to others
    });

    // Save Document
    socket.on("save-document", async (delta) => {
      // Save delta to note_id in DB
    });
  });
});

// Get Delta from DB
function getDocument(note_id) {
  return "Yo";
}

// FILE STORAGE -----
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage: storage });

// MIDDLEWARE -----
app.use(express.json()); // Allows access to req.body
app.use(cors()); // Allows different-domain app interaction
app.use(bodyParser.json()); // Parse the JSON request body
dotenv.config(); // Reading .env files

// FILE STORAGE EXAMPLES -----
app.post("/photo", uploads.single("photo"), function (req, res, next) {
  console.log(req.file); // File Data
  res.json({ status: "Single File Recieved" });
});

app.post("/photos", uploads.array("photos"), function (req, res, next) {
  // .array means "Multiple Photos with Key 'photos'"
  console.log(req.files); // Files Data
  res.json({ status: "Multiple Files recieved" });
});

// SUPABASE FILE STORAGE EXAMPLES -----
app.post("/supabasephoto", uploads.single("image"), async (req, res) => {
  try {
    const filename = Date.now() + req.file.originalname;
    const image = await supabase.storage
      .from("images") // Bucket Name
      .upload(filename, req.file.buffer); // Filepath name
    if (image.error) throw image.error;

    // Get URL of image that was just passed in
    const url = supabase.storage.from("images").getPublicUrl(filename);
    console.log(url.data.publicUrl);

    res.json({ status: "Single File Recieved" });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

app.delete("/supabasephoto", async (req, res) => {
  try {
    let { image } = req.query;
    const filename = image.split("/").at(-1);
    console.log(filename);
    const oldimage = await supabase.storage.from("images").remove(filename);
    console.log(oldimage);
    if (oldimage.error) throw oldimage.error;

    res.json({ status: "Single File Deleted" });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
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

    // Upload Image to Supabase
    let filename = req.file.originalname.replace(/\s/g, "");
    filename = Date.now() + filename;
    const image = await supabase.storage
      .from("images")
      .upload(filename, req.file.buffer);
    if (image.error) throw image.error;

    // Get URL of image that was just uploaded
    let url = supabase.storage.from("images").getPublicUrl(filename);
    url = url.data.publicUrl;

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
      image_input: url,
    });
    if (user.error) throw user.error; // handle errors like so
    user = user.data[0];

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
    if (!first_name || !last_name || !username || !req.file) {
      return res.status(400).send({ response: "Missing Parameters" });
    }

    // Upload newimage to Supabase
    let filename = req.file.originalname.replace(/\s/g, "");
    filename = Date.now() + filename;
    const image = await supabase.storage
      .from("images")
      .upload(filename, req.file.buffer);
    if (image.error) throw image.error;

    // Get URL of newimage
    let url = supabase.storage.from("images").getPublicUrl(filename);
    url = url.data.publicUrl;

    // Get URL of oldimage
    let oldimage = await supabase.rpc("getuser", {
      chan_id_input: chan_id,
    });
    if (oldimage.error) throw oldimage.error;
    let oldimageurl = oldimage.data[0].image;
    oldimageurl = oldimageurl.toString().split("/").at(-1);
    // Delete Old Image
    let removedimage = await supabase.storage
      .from("images")
      .remove(oldimageurl);
    if (removedimage.error) throw removedimage.error;

    // Update User
    let user = await supabase.rpc("setuser", {
      first_name_input: first_name,
      last_name_input: last_name,
      username_input: username,
      image_input: url,
      chan_id_input: chan_id,
    });

    if (user.error) throw user.error;
    delete user.data.google_id;
    res.send(user.data[0]);
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

// Alternative to app.listen(5000, () => { });
server.listen(5000, () => {
  console.log("Server Started at PORT 5000");
});
