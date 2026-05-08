const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const contactRoutes = require("./routes/contact");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "O2BO backend is running" });
});

app.use("/api/contact", contactRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
