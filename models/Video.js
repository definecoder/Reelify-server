const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  prompt: {
    type: String,
  },

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
  imagePrompts: [
    {
      type: String,
    },
  ],
  finalAudioUrl: {
    type: String,
  },
  durationInSeconds: [
    {
      type: Number,
    },
  ],

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
