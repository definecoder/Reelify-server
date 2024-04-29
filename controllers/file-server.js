const { getFile, deleteFile } = require("../services/aws/file-server");
const axios = require("axios");

const getFileFromAWS = async (req, res) => {
  try {
    const url = await getFile(req.params.fileName);

    const response = await axios.get(url, { responseType: "stream" });

    res.setHeader("Content-Type", response.headers["content-type"]);

    response.data.pipe(res);
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
