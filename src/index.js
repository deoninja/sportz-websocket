import express from 'express'

const app = express();
const port = 8000;

// Use JSON middleware
app.use(express.json());

// Root GET route that returns a short message
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sportz server!' });
});

// Configure server to listen on port 8000 and log URL when server starts
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
