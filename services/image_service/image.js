const OpenAI = require("openai");
const axios = require("axios");
const sharp = require("sharp");
const dotenv = require("dotenv");

dotenv.config();

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { Upload } = require("@aws-sdk/lib-storage");

// console.log(process.env.OPENAI_API_KEY);

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

async function getImage(text, id) {
  try {
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: text,
    });

    // return image.data[0].url;
    const { data } = await axios.get(image.data[0].url, {
      responseType: "arraybuffer",
    });

    const resizedImage = await sharp(data)
      .resize(540, 960)
      .jpeg({ quality: 80 })
      .toBuffer();

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: id + ".jpg",
        Body: resizedImage,
        ContentType: "image/jpeg",
      },
    });

    await upload.done();
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// getImage(
//   "A logo of AI Interview company, an robot is taking interview of a human. This is the concept now embed this concept in a logo, the logo should be simple and the color scheme should be only red black and white ",
//   "iv"
// );

module.exports = { getImage };
