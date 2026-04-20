const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  userId: String,
  text: String,
  done: Boolean,
  reminder: String // ⏰ NEW FIELD (time)
});

module.exports = mongoose.model("Task", TaskSchema);