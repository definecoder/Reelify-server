const express = require("express");
const {
  getFileFromAWS,
  deleteFileFromAWS,
} = require("../controllers/file-server");

const router = express.Router();

router.route("/:fileName").get(getFileFromAWS);
router.route("/:fileName").delete(deleteFileFromAWS);

module.exports = router;
