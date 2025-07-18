const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Mongoose Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

const customerSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  visits: { type: Number, default: 0 },
  lastVisit: Date,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
const Customer = mongoose.model("Customer", customerSchema);

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  const { username, pin } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Username already exists" });

    const user = new User({ username, pin });
    await user.save();
    res.status(201).json({ userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, pin } = req.body;
  try {
    const user = await User.findOne({ username, pin });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// Customer Routes
app.post("/api/customers", async (req, res) => {
  const { name, phone, userId } = req.body;
  try {
    const existing = await Customer.findOne({ phone, userId });
    if (existing) return res.status(409).json({ error: "Customer already exists" });

    const newCustomer = new Customer({ name, phone, userId });
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: "Failed to add customer" });
  }
});

app.post("/api/customers/:phone/visit", async (req, res) => {
  const { phone } = req.params;
  const { userId } = req.body;
  try {
    const customer = await Customer.findOne({ phone, userId });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    customer.visits += 1;
    customer.lastVisit = new Date();
    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: "Failed to log visit" });
  }
});

app.get("/api/customers", async (req, res) => {
  const { userId } = req.query;
  try {
    const customers = await Customer.find({ userId });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 GlowPoints backend running at http://localhost:${PORT}`);
});
