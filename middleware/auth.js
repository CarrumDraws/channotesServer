import jwt from "jsonwebtoken";

// (Authorization): Validate JWT
export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET); // Returns decoded UserID
    req.user = verified; // Set request data, so the next middleware can read it
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
