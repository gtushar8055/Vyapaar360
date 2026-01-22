import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Shop from "../models/Shop.js";

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      shopName,
      shopAddress,
      gstNumber,
      bankName,
      bankAccountNumber,
      bankIFSC,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !shopName ||
      !shopAddress ||
      !gstNumber ||
      !bankName ||
      !bankAccountNumber ||
      !bankIFSC
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const shop = await Shop.create({
      shopName,
      shopAddress,
      gstNumber,
      bankName,
      bankAccountNumber,
      bankIFSC,
      owner: user._id,
    });

    user.shop = shop._id;
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        shopId: shop._id,
        shopName: shop.shopName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        shopId: shop._id,
        shopName: shop.shopName,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 2. Find user
    const user = await User.findOne({ email }).populate("shop");
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid email or password" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid email or password" });
    }

    // 4. Generate JWT
  const token = jwt.sign(
  {
    userId: user._id,
    email: user.email,
    shopId: user.shop?._id,
    shopName: user.shop?.shopName,
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);



    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        shopId: user.shop?._id,
        shopName: user.shop?.shopName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

