const pool = require("../db");
const jwt = require("jsonwebtoken");

// (Authorization): Validate JWT + Sets chan_id in header
async function verifyToken(req, res, next) {
  try {
    let token = req.header("Authorization");
    if (!token) return res.status(401).send("Access Denied");

    if (token.startsWith("Bearer "))
      token = token.slice(7, token.length).trimLeft();

    const verification = jwt.verify(token, process.env.JWT_SECRET); // Returns decoded chan_id

    // Check if chan_id is in DB
    let user = await pool.query("SELECT * FROM users WHERE chan_id = $1", [
      verification.chan_id,
    ]);

    if (!user.rows.length) return res.status(403).send("Invalid Bearer Token ");
    req.user = verification; // Set request data, so the next middleware can read it
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { verifyToken };
