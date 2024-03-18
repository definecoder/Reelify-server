const express = require("express");
const dotenv = require("dotenv");
const multer = require("multer");

const { spawn } = require("child_process");

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

dotenv.config(); // Load environment variables from a .env file into process.env

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

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log(req.body, "end of req body    ");
    console.log(req.file);

    const params = {
      Bucket: bucketName,
      Key: req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    await s3.send(command);

    res.send("File uploaded successfully!");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error uploading file");
  }
});

app.get("/image/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;
    const params = {
      Bucket: bucketName,
      Key: imageName,
    };

    const command = new GetObjectCommand(params);

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // get duration of audio
    const duration = await getAudioDuration(url);
    console.log("Duration:", duration);

    res.send({ url, duration });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting image");
  }
});

app.delete("/image/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;
    const params = {
      Bucket: bucketName,
      Key: imageName,
    };

    const command = new DeleteObjectCommand(params);

    s3.send(command);

    res.send("File deleted successfully!");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting image");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const getAudioDuration = (url) => {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      url,
    ]);

    ffprobe.stdout.on("data", (data) => {
      const durationInSeconds = Math.ceil(parseFloat(data.toString()));
      resolve(durationInSeconds);
    });

    ffprobe.stderr.on("data", (data) => {
      reject(data.toString());
    });
  });
};
