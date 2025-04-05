const mongoose = require("mongoose");

const PollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, required: true }, // e.g., single-choice, rating, yes/no, etc.
  options: [
    {
      optionText: { type: String, required: true },
      votes: { type: Number, default: 0 }, // For vote tracking
    },
  ],
  responses: [
    {
      voterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // For open-ended polls
      responseText: { type: String }, // User-submitted text response
      createdAt: { type: Date, default: Date.now },
    },
  ],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // To prevent multiple votes
  createdAt: { type: Date, default: Date.now },
  closed: { type: Boolean, default: false }, // To mark polls as closed
});

module.exports = mongoose.model("Poll", PollSchema);
