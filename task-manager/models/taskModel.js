const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: [true, "Title is required"],
    minlength: [3, "Title must contain at least 3 characters"],
    maxlength: [100, "Title must not exceed 100 characters"],
    trim: true,
  },
  description: {
    type: String,
    maxlength: [500, "Description must not exceed 500 characters"],
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return value > new Date();
      },
      message: "Due date must be in the future",
    },
    required: true,
  },
  //   assignedTo: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'User', // Reference to the User model
  //   },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
});

taskSchema.pre(/^find/, function (next) {
  this.select(" -__v  -createdAt ");
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
