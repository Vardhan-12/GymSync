// ================== IMPORTS ==================
const User = require("../models/User");
const Session = require("../models/Session");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================== TOKEN HELPERS ==================

// 🔹 Generate Access Token (short-lived)
const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" } // keep consistent with your project
  );
};

// 🔹 Generate Refresh Token (long-lived)
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};


// ================== AUTH CONTROLLERS ==================

// 🔹 REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // ✅ IMPORTANT: send user also (frontend needs it)
    res.status(200).json({
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        gymName: user.gymName,
        preferredWorkoutTime: user.preferredWorkoutTime
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // rotate token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};


// 🔹 LOGOUT
exports.logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.json({ message: "Logged out successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================== PROFILE CONTROLLERS ==================

// 🔹 GET LOGGED-IN USER PROFILE
exports.getMyProfile = async (req, res) => {
  try {
    // req.user comes from auth middleware
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update fields safely
    Object.assign(user, req.body);

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsersFromSessions = async (req, res) => {
  try {
    const sessions = await Session.find().select("createdBy");

    const userIds = [
      ...new Set(sessions.map((s) => s.createdBy.toString())),
    ];

    const users = await User.find({ _id: { $in: userIds } })
      .select("name email createdAt");

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};