const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();  // Load .env file

// Create instance of express
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB with improved error handling
mongoose.set('strictQuery', true); // To avoid warnings with Mongoose 7.x
const connectDB = async () => {
  try {
    // Use MONGODB_URI from the environment variables
    const mongoURI = process.env.MONGODB_URI;  
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully'); 
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit the process if connection fails
  }
};

connectDB();

// Create the Todo schema
const todoSchema = new mongoose.Schema({
  title: {
    required: true, 
    type: String
  },
  description: {
    required: true,
    type: String 
  }
});

// Create the Todo model
const todoModel = mongoose.model('Todo', todoSchema);

// POST route to create a new todo item
app.post('/todos', async (req, res) => {
  const { title, description } = req.body;
  try {
    const newTodo = new todoModel({ title, description });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating todo item', error: error.message });
  }
});

// GET route to fetch all todo items
app.get('/todos', async (req, res) => {
  try {
    const todos = await todoModel.find();
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching todo items', error: error.message });
  }
});

// PUT route to update a todo item
app.put('/todos/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;
    const updatedTodo = await todoModel.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating todo item', error: error.message });
  }
});

// DELETE route to delete a todo item
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await todoModel.findByIdAndDelete(id);
    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting todo item', error: error.message });
  }
});

// Start the server on port 8000
const port = 8000;
app.listen(port, () => { 
  console.log(`Server listening on port ${port}`);
});
