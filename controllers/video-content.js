const crypto = require("crypto");
const Video = require("../models/Video");
const { getPrompt } = require("../services/text_service/prompt");
const { getImagePrompts } = require("../services/image_service/image-prompts");
const { getSpeech } = require("../services/audio_service/text-to-speech");
const { getImage } = require("../services/image_service/image");
const baseUrl = require("../utils/constants");

// console.log(baseUrl);

const createVideoContent = async (req, res) => {
  try {
    console.log("api hit, getting voice script");
    const { text } = req.body;

    const videoID = crypto.randomBytes(16).toString("hex");

    var voiceScripts = await getPrompt(text);
    var imagePrompts = await getImagePrompts(voiceScripts);
    voiceScripts = voiceScripts.replace(/,\s*([\]}])/g, "$1");
    imagePrompts = imagePrompts.replace(/,\s*([\]}])/g, "$1");

    voiceScripts = JSON.parse(voiceScripts);

    imagePrompts = JSON.parse(imagePrompts);
    voiceScripts = Object.values(voiceScripts);
    imagePrompts = Object.values(imagePrompts);

    const imageUrls = [];
    const audioUrls = [];
    const durationInSeconds = [];

    for (let i = 0; i < imagePrompts.length; i++) {
      console.log("getting image " + i);
      i == imagePrompts.length - 1
        ? await getImage(imagePrompts[i], videoID + i)
        : getImage(imagePrompts[i], videoID + i);
      imageUrls.push(baseUrl + "/file/" + videoID + i + ".jpg");
    }

    for (let i = 0; i < voiceScripts.length; i++) {
      console.log("getting audio " + i);
      const audioData = await getSpeech(voiceScripts[i], videoID + i);
      audioUrls.push(audioData.url);
      durationInSeconds.push(audioData.duration);
    }

    const video = new Video({
      videoID,
      voiceScripts,
      imagePrompts,
      imageUrls,
      audioUrls,
      durationInSeconds,
    });

    await video.save();

    setTimeout(() => {
      res.status(200).json(video);
    }, 5000);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating video content");
  }
};

const getVideoContentByID = async (req, res) => {
  try {
    const videoID = req.params.videoID;

    const video = await Video.findOne({ videoID }).select("-_id -__v").exec();

    if (!video) {
      return res.status(404).send("Video not found");
    }

    res.status(200).json(video);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting video content");
  }
};

module.exports = { createVideoContent, getVideoContentByID };
