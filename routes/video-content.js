const express = require("express");
const {
  createVideoContent,
  getVideoContentByID,
} = require("../controllers/video-content");

const router = express.Router();

router.route("/create-video-content").post(createVideoContent);
router.route("/get-video-content/:videoID").get(getVideoContentByID);

module.exports = router;
