const {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// dotenv.config(); // Load environment variables from a .env file into process.env

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

const getFile = async (fileName) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    const command = new GetObjectCommand(params);

    const url = await getSignedUrl(s3, command);

    return url;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteFile = async (fileName) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    const command = new DeleteObjectCommand(params);

    s3.send(command);

    console.log("File deleted successfully!");
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  getFile,
  deleteFile,
};
