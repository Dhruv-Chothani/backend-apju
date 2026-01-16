const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB(); // 👈 THIS MUST EXIST

app.use(cors());
app.use(express.json());

app.use("/api/content", require("./routes/content.routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
