require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://sathwikpentakoti:Sai4575@cluster0.czdmnzx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI, {
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Task Schema
const leadSchema = new mongoose.Schema({
  task: { type: String, required: true },
  deadline: { type: String, required: true },
});

const Lead = mongoose.model("Lead", leadSchema);

// Route to create a new task
app.post("/api/task", async (req, res) => {
  try {
    console.log("Received data:", req.body);
    const { task, deadline } = req.body;

    if (!task || !deadline) {
      return res.status(400).json({ message: "Task and deadline are required." });
    }

    const newLead = new Lead({ task, deadline });
    await newLead.save();

    res.status(200).json({ message: "Task saved successfully!" });
  } catch (error) {
    console.error("Error saving task:", error);
    res.status(500).json({ message: "Error processing your request." });
  }
});

// Route to get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Lead.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks." });
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
