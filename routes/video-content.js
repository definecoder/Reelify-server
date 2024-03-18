const express = require("express");
const { createVideoContent } = require("../controllers/video-content");

const router = express.Router();

router.route("/create-video-content").post(createVideoContent);

module.exports = router;
