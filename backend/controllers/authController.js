const User = require("../models/User");
const Poll = require("../models/Poll");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register User
exports.registerUser = async (req, res) => {
  const { fullName, username, email, password, profileImageUrl } = req.body;

  // Validation: Check for missing fields
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validation: Check username format
  // Allows alphanumeric characters and hyphens only
  const usernameRegex = /^[a-zA-Z0-9-]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      message:
        "Invalid username. Only alphanumeric characters and hyphens are allowed. No spaces are permitted.",
    });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "Username not available. Try another one." });
    }

    // Create the user
    const user = await User.create({
      fullName,
      username,
      email,
      password,
      profileImageUrl,
    });

    res.status(201).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validation: Check for missing fields
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Count polls created by the user
    const totalPollsCreated = await Poll.countDocuments({ creator: user._id });

    // Count polls the user has voted in
    const totalPollsVotes = await Poll.countDocuments({
      voters: user._id,
    });

    // Get the count of bookmarked polls
    const totalPollsBookmarked = user.bookmarkedPolls.length;

    res.status(200).json({
      id: user._id,
      user: {
        ...user.toObject(),
        totalPollsCreated,
        totalPollsVotes,
        totalPollsBookmarked,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

// Get user info
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Count polls created by the user
    const totalPollsCreated = await Poll.countDocuments({ creator: user._id });

    // Count polls the user has voted in
    const totalPollsVotes = await Poll.countDocuments({
      voters: user._id,
    });

    // Get the count of bookmarked polls
    const totalPollsBookmarked = user.bookmarkedPolls.length;

    // Add the new attributes to the response
    const userInfo = {
      ...user.toObject(),
      totalPollsCreated,
      totalPollsVotes,
      totalPollsBookmarked,
    };

    res.status(200).json(userInfo);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};
