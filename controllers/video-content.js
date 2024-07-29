const crypto = require("crypto");
const Video = require("../models/Video");
const OpenAI = require("openai");
const { getPrompt } = require("../services/text_service/prompt");
const { getImagePrompts } = require("../services/image_service/image-prompts");
const { getSpeech } = require("../services/audio_service/text-to-speech");
const { getImage } = require("../services/image_service/image");
const baseUrl = require("../utils/constants");

const VIDEO_PER_PAGE = 10;

// console.log(baseUrl);

const createVideoContent = async (req, res) => {
  try {
    // res.set("content-type", "application/json");

    // res.write('{"message": "Video creation completed", "video":');

    console.log("api hit, getting voice script");
    const { text, apiKey } = req.body;

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const videoID = crypto.randomBytes(16).toString("hex");

    var voiceScripts = await getPrompt(text, openai);
    var imagePrompts = await getImagePrompts(voiceScripts, openai);
    voiceScripts = voiceScripts.replace(/,\s*([\]}])/g, "$1");
    imagePrompts = imagePrompts.replace(/,\s*([\]}])/g, "$1");

    voiceScripts = JSON.parse(voiceScripts);

    imagePrompts = JSON.parse(imagePrompts);
    voiceScripts = Object.values(voiceScripts);
    imagePrompts = Object.values(imagePrompts);

    const imageUrls = [];
    const audioUrls = [];
    const durationInSeconds = [];

    const imagePromises = [];

    for (let i = 0; i < imagePrompts.length; i++) {
      console.log("getting image " + i);
      // i == imagePrompts.length - 1
      //   ? await getImage(imagePrompts[i], videoID + i)
      //   : getImage(imagePrompts[i], videoID + i);

      imagePromises.push(getImage(imagePrompts[i], videoID + i, openai));

      imageUrls.push(baseUrl + "/file/" + videoID + i + ".jpg");
    }

    for (let i = 0; i < voiceScripts.length; i++) {
      console.log("getting audio " + i);
      const audioData = await getSpeech(voiceScripts[i], videoID + i, openai);
      audioUrls.push(audioData.url);
      durationInSeconds.push(audioData.duration);
    }

    await Promise.all([...imagePromises]);

    const video = new Video({
      prompt: text,
      videoID,
      voiceScripts,
      imagePrompts,
      imageUrls,
      audioUrls,
      durationInSeconds,
    });

    await video.save();

    res.status(201).json(video);
    // res.write(JSON.stringify(video) + "}");
    // res.end();
  } catch (error) {
    console.log(error);
    // res.write('{"message": "Error creating video content"}');
    // res.end();
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

const getAllVideoContents = async (req, res) => {
  try {
    const { page } = req.query;

    const videos = await Video.find()
      .select("-_id -__v")
      .sort({ createdAt: "desc" })
      .skip((page - 1) * VIDEO_PER_PAGE)
      .limit(VIDEO_PER_PAGE)
      .exec();
    res.status(200).json(videos);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting all video contents");
  }
};

module.exports = {
  createVideoContent,
  getVideoContentByID,
  getAllVideoContents,
};
