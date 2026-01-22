import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Shop from "../models/Shop.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const shop = await Shop.findOne({ owner: user._id });
    if (!shop) {
      return res.status(400).json({ message: "Shop not found for user" });
    }

    req.user = user;
    req.shop = shop; // THIS IS THE KEY

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized" });
  }
};
