const express = require('express');
const cors = require('cors');
const connectDB = require('./db/db')
const app = express();

// Enable CORS for all routes
const corsOptions = {
  origin: "*",
  credentials: false, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
const authRoutes = require("../src/auth/routes/routes");
const authMiddleware = require('./auth/middleware/authVerification');
const taskRoutes = require("./task/routes/routes");
app.use(cors(corsOptions));

connectDB();

// Middleware to parse JSON requests
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use("/api/v1/auth", authRoutes);

// Apply authMiddleware for all other routes
app.use(authMiddleware);

app.use("/api/v1/task", taskRoutes);

// Set the port to 3000 (default)
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
