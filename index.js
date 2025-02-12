// Import necessary modules
const express = require('express'); // Framework for building web applications
const cookieParser = require("cookie-parser"); // Middleware for parsing cookies
const mongoose = require('mongoose'); // MongoDB object modeling tool
const dotenv = require('dotenv'); // Module to load environment variables from .env file
const { apiRouter } = require("./routes/index.js"); // Import the main API router
const cors = require('cors')

dotenv.config();


// Initialize the express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

app.use(
  cors({
      origin: ["http://localhost:5173"],
      methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
      credentials: true,
  })
);

// Middleware to parse cookies
app.use(cookieParser());

// Define the port for the server
const port = 3001;

// Load environment variables from the .env file
dotenv.config("./.env");

// Retrieve the database password from environment variables
const dbpassword = process.env.DB_PASSWORD;

// Connect to the MongoDB database
mongoose.connect(`mongodb+srv://abhirajars1998:${dbpassword}@ecommerce.2mbnd.mongodb.net/`)
  .then(res => {
    console.log("DB connected successfully"); // Log success message if connection succeeds
  })
  .catch(err => {
    console.log("DB connection failed"); // Log error message if connection fails
  });

// Define a simple route for the root URL
app.get('/', (req, res) => {
  res.send('Hello World!'); // Send a response for the root route
});

// Define a test route for checking server functionality
app.get('/test', (req, res) => {
  res.send('test'); // Send a response for the test route
});

// Define the main API router for handling all routes
app.use("/api", apiRouter); // Use the main API router for handling '/api' routes

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`); // Log the server start message
});
