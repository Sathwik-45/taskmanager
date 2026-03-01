require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("CRITICAL: MONGODB_URI is not defined in .env");
  process.exit(1);
}

mongoose.connect(dbURI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
})
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// Task Schema
const leadSchema = new mongoose.Schema({
  task: { type: String, required: true },
  deadline: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  category: { type: String, default: 'General' },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  description: { type: String, default: '' },
}, { timestamps: true });

const Lead = mongoose.model("Lead", leadSchema);

// Route to create a new task
app.post("/api/task", async (req, res) => {
  try {
    console.log("Received data:", req.body);
    const { task, deadline, priority, category, description } = req.body;

    if (!task || !deadline) {
      return res.status(400).json({ message: "Task and deadline are required." });
    }

    const newLead = new Lead({
      task,
      deadline,
      priority: priority || 'Medium',
      category: category || 'General',
      description: description || ''
    });
    await newLead.save();

    res.status(200).json({ message: "Task saved successfully!" });
  } catch (error) {
    console.error("CRITICAL ERROR SAVING TASK:", error);
    res.status(500).json({ message: "Error processing your request.", details: error.message });
  }
});

// Route to get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("CRITICAL ERROR FETCHING TASKS:", error);
    res.status(500).json({ message: "Error fetching tasks.", details: error.message });
  }
});

// Route to update a task (status or other fields)
app.patch("/api/task/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTask = await Lead.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.status(200).json({ message: "Task updated successfully!", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Error updating task." });
  }
});

// Route to delete multiple tasks (Bulk Delete)
app.delete("/api/tasks/bulk", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No task IDs provided for deletion." });
    }

    const result = await Lead.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      message: `${result.deletedCount} tasks deleted successfully!`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    res.status(500).json({ message: "Error performing bulk deletion." });
  }
});

// Route to delete a task by ID
app.delete("/api/task/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Lead.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found." });
    }
    res.status(200).json({ message: "Task deleted successfully!" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Error deleting task." });
  }
});

// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
