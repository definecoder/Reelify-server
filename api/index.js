const express = require("express");
const dotenv = require("dotenv");
const corsConfig = require("../utils/cors-config");
dotenv.config();
const videoContentRoutes = require("../routes/video-content");
const fileServerRoutes = require("../routes/file-server");
require("../db/database");

const app = express();

const port = process.env.PORT || 3000;

app.use(corsConfig);
app.use(express.json());

app.use("/video-content", videoContentRoutes);
app.use("/file", fileServerRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {  
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
