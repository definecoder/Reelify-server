const express = require("express");
const {
  createVideoContent,
  getVideoContentByID,
  getAllVideoContents,
} = require("../controllers/video-content");

const router = express.Router();

router.route("/create-video-content").post(createVideoContent);
router.route("/get-video-content/:videoID").get(getVideoContentByID);
router.route("/all").get(getAllVideoContents);

module.exports = router;
