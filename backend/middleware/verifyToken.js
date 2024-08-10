import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ suc: false, message: "Unauthor no token" });
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode)
      return res.status(401).json({ suc: false, message: "Invalid  token" });
    req.userId = decode.userId;
    next();
  } catch (e) {
    res.status(500).json({ suc: false, message: "server error" });
  }
};
