const supabase = require("../supabase.js");
const jwt = require("jsonwebtoken");

// (Authorization): Validate JWT + Sets chan_id in header
async function verifyToken(req, res, next) {
  try {
    console.log("Sup");
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if (!token) return res.status(401).send({ response: "Access Denied" });
    const verification = jwt.verify(token, process.env.JWT_SECRET); // Returns decoded chan_id

    // Check if chan_id is in DB
    let { error, data } = await supabase
      .from("users")
      .select()
      .eq("chan_id", verification.chan_id);
    if (error) throw new Error(error.message);
    const user = data?.[0];
    if (!user)
      return res.status(403).send({ response: "Invalid Bearer Token " });
    req.user = verification; // Set request data, so the next middleware can read it
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { verifyToken };
