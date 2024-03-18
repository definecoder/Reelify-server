// import fs from "fs";
// import path from "path";
// import OpenAI from "openai";

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const { parseBuffer } = require("music-metadata");

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const getAudioDuration = require("./duration");
dotenv.config();
const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getSpeech(text, fileName) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // upload to s3
    const upload = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName + ".mp3",
      Body: buffer,
      ContentType: "audio/mpeg",
    });

    await s3.send(upload);

    const params = {
      Bucket: bucketName,
      Key: fileName + ".mp3",
    };

    const command = new GetObjectCommand(params);

    const url = await getSignedUrl(s3, command);

    let durationInSeconds = await getAudioDurationFromBuffer(buffer);
    durationInSeconds = Math.ceil(durationInSeconds);

    return { url, duration: durationInSeconds };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// const serveSpeech = (req, res) => {
//   res.sendFile("./speeches/" + req.params.link, {
//     root: __dirname + "/..",
//   });
// };

// const serveMergedAudio = (req, res) => {
//   res.sendFile("./final_audio/" + req.params.link, {
//     root: __dirname + "/..",
//   });
// };
const getAudioDurationFromBuffer = async (buffer) => {
  try {
    // Parse the buffer to extract metadata
    const metadata = await parseBuffer(buffer, "audio/mpeg", {
      duration: true,
    });

    // Extract duration from metadata
    const durationInSeconds = metadata.format.duration;

    return durationInSeconds;
  } catch (error) {
    console.error("Error parsing audio buffer:", error);
    throw error;
  }
};

module.exports = { getSpeech };
