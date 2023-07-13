const jwt = require("jsonwebtoken");

// (Authorization): Validate JWT + Sets chan_id in header
async function verifyToken(req, res, next) {
  try {
    let token = req.header("Authorization");
    console.log(token);
    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET); // Returns decoded chan_id
    console.log("verifyToken chanID");
    console.log(verified);
    req.user = verified; // Set request data, so the next middleware can read it
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { verifyToken };
