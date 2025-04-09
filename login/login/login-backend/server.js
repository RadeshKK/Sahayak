const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to local MongoDB (Compass)
mongoose.connect('mongodb://127.0.0.1:27017/senior_companion', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Define a schema for your form
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  age: Number,
  gender: String,
  emergencyContactName: String,
  emergencyContactNumber: String,
  physician: String,
  hospital: String,
  bloodGroup: String,
  allergies: String,
  medications: String,
  surgeries: String,
  conditions: String,
  limitations: String,
  recentChanges: String,
  vaccination: String,
  password: String
});

// Create model
const User = mongoose.model('User', userSchema);

// POST endpoint to receive form data
app.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving user' });
  }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({
        email: email.trim(),
        password: password.trim()
      });
  
      if (user) {
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.json({ success: false, message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Login error' });
    }
  });

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
