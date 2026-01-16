const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const contentRoutes = require("./routes/content.routes");
app.use("/api/content", contentRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
