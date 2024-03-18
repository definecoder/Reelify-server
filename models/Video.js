const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  videoID: {
    type: String,
  },
  voiceScripts: [
    {
      type: String,
    },
  ],
  imageUrls: [
    {
      type: String,
    },
  ],
  audioUrls: [
    {
      type: String,
    },
  ],
  imageScripts: [
    {
      type: String,
    },
  ],
  finalAudioUrl: {
    type: String,
  },

  createdBy: {
    type: String,
    default: "sdsd",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Video = mongoose.model("Video", VideoSchema);

module.exports = Video;
