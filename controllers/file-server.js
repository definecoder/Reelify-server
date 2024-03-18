const { getFile, deleteFile } = require("../services/aws/file-server");

const getFileFromAWS = async (req, res) => {
  try {
    const url = await getFile(req.params.fileName);
    // this url refers to the file in the AWS S3 bucket
    // I want to send a response that will show the image in the browser
    res.send(`<img src="${url}" alt="Image from AWS S3">`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting file");
  }
};

const deleteFileFromAWS = async (req, res) => {
  try {
    deleteFile(req.params.fileName);
    res.send("File deleted successfully!");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting file");
  }
};

module.exports = {
  getFileFromAWS,
  deleteFileFromAWS,
};
