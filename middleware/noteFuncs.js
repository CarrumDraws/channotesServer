const jwt = require("jsonwebtoken");
const supabase = require("../supabase");

// Get Full Note Data from DB
// Returns BOTH user and noteData
async function getDocument(socket, token, note_id) {
  try {
    let user = await verifyToken(token);
    let noteData = await getNote(user.chan_id, note_id);
    return { user: user, noteData: noteData };
  } catch (err) {
    console.log("getDocument Error: " + err.message);
    socket.emit("error", "Error while Getting Document: " + err.message);
  }
}

// Save Note Data to DB
async function saveDocument(socket, chan_id, note_id, title, text) {
  try {
    let noteData = await putNote(chan_id, note_id, title, text);
    return noteData;
  } catch (err) {
    console.log("saveDocument Error: " + err.message);
    socket.emit("error", "Error while Saving Document: " + err.message);
  }
}

// Functional Version of verifyToken()
// Change so it just checks if token is equal to a provided chan_id
async function verifyToken(token) {
  try {
    if (!token) throw new Error("Missing Params");
    const verification = jwt.verify(token, process.env.JWT_SECRET);
    let { error, data } = await supabase
      .from("users")
      .select()
      .eq("chan_id", verification.chan_id);
    if (error) throw new Error(error.message);
    const user = data?.[0];
    if (!user) throw new Error("Invalid Bearer Token");
    return user;
  } catch (err) {
    throw new Error(err);
  }
}

// Gets All Note Data
async function getNote(chan_id, note_id) {
  try {
    if (!chan_id || !note_id) throw new Error("Missing Params");
    let { error, data } = await supabase.rpc("getnote", {
      chan_id_input: chan_id,
      note_id_input: note_id,
    });
    if (error) throw new Error(error.message);
    const note = data?.[0];
    if (!note) throw new Error("Note Not Found");
    return res.json(note);
  } catch (err) {
    throw new Error(err.message);
  }
}

// Edits Notetext
async function putNote(chan_id, note_id, title, subtext, text) {
  try {
    if (
      !chan_id ||
      !note_id ||
      title == null ||
      subtext == null ||
      text == null
    )
      throw new Error("Missing Params");
    let date = new Date();
    let time = date.toISOString().slice(0, 19).replace("T", " ");
    let { error, data } = await supabase.rpc("editnotetext", {
      chan_id_input: chan_id,
      note_id_input: note_id,
      title_input: title,
      subtext_input: subtext,
      text_input: text,
      time_input: time,
    });
    if (error) throw new Error(error.message);
    const note = data?.[0];
    if (!note) throw new Error("Note Not Found");
    return res.json(note);
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = { getDocument, saveDocument };
