const authRoutes = require("./routes/auth.js");
const usersRoutes = require("./routes/users.js");
const foldersRoutes = require("./routes/folders.js");
const noteRoutes = require("./routes/note.js");
const notesRoutes = require("./routes/notes.js");
const sharesRoutes = require("./routes/shares.js");
const userRoutes = require("./routes/users.js");
const { verifyToken } = require("./middleware/auth.js");
const {
  getDocument,
  saveDeltaText,
  saveTitle,
} = require("./middleware/noteFuncs.js");

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
    origin: [
      "http://localhost:3000",
      "https://charming-cuchufli-853ec9.netlify.app",
      "https://channotes-server.onrender.com",
    ],
    methods: ["GET", "POST"],
  },
});

// NOTE SOCKETIO -----
io.on("connection", (socket) => {
  socket.on("get-document", async (token, note_id) => {
    try {
      const { user, noteData } = await getDocument(socket, token, note_id);
      if (!user || !noteData) throw new Error("No Note Returned");

      socket.join(note_id); // Join Note Room
      socket.emit("load-document", noteData); // Load Note Room Data

      // Broadcast Text Changes to Note Room
      socket.on("send-text-changes", (delta) => {
        socket.broadcast.to(note_id).emit("recieve-text-changes", delta);
      });

      // Broadcast Title Changes to Note Room + Save
      socket.on("send-title-changes", async (chan_id, title) => {
        if (user.chan_id == chan_id) {
          socket.broadcast.to(note_id).emit("recieve-title-changes", title);
          await saveTitle(socket, chan_id, note_id, title);
        } else {
          console.log("saveTitle Error: invalid chan_id");
          socket.emit("error", "Error while Saving Title: invalid chan_id");
        }
      });

      // Save Document
      socket.on("save-text", async (chan_id, text, delta) => {
        if (user.chan_id == chan_id)
          await saveDeltaText(socket, chan_id, note_id, text, delta);
        else {
          console.log("saveDeltaText Error: invalid chan_id");
          socket.emit("error", "Error while Saving Document: invalid chan_id");
        }
      });
    } catch (err) {
      console.log("SocketIO Error: " + err.message);
      socket.emit("error", "SocketIO Error: " + err.message);
    }
  });
});

// FILE STORAGE -----
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage: storage });

// MIDDLEWARE -----
app.use(express.json()); // Allows access to req.body
app.use(cors()); // Allows different-domain app interaction
app.use(bodyParser.json()); // Parse the JSON request body
dotenv.config(); // Reading .env files

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
    if (image.error) throw new Error(image.error.message);

    // Get URL of image that was just uploaded
    let url = supabase.storage.from("images").getPublicUrl(filename);
    if (url.error) throw new Error(url.error.message);
    url = url.data.publicUrl;

    // bcrypt google_id
    const salt = await bcrypt.genSalt();
    const googleHash = await bcrypt.hash(google_id, salt);

    // Save User to Supabase + Creates "Your Folders" folder
    let { data, error } = await supabase.rpc("signup", {
      google_id_input: googleHash,
      first_name_input: first_name,
      last_name_input: last_name,
      username_input: username,
      email_input: email,
      image_input: url,
    });
    if (error) throw new Error(error.message);
    user = data?.[0];
    if (!user) throw new Error("User Creation Error");
    const token = jwt.sign({ chan_id: user.chan_id }, process.env.JWT_SECRET);
    return res.json({ token, user });
  } catch (err) {
    return res.status(404).json({ message: err.message });
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
// On Render, Port Num is overridden.
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server Started at PORT ${process.env.PORT || 5000}`);
});
