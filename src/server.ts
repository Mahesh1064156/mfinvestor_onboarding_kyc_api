const express = require("express");

const app = express();
const PORT = 5000;

// Route
app.get("/", (req, res) => {
  res.send("Hi 👋");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});