const { getFile, deleteFile } = require("../services/aws/file-server");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

const getFileFromAWS = async (req, res) => {
  try {
    // check if the file exists, if so then send the file

    let filePath = os.tmpdir() + "/" + req.params.fileName;
    filePath = path.resolve(filePath);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);

      return;
    } else {
      const url = await getFile(req.params.fileName);
      const response = await axios.get(url, { responseType: "stream" });
      // save the file to the server
      const file = fs.createWriteStream(
        path.resolve(os.tmpdir() + "/" + req.params.fileName)
      );
      response.data.pipe(file);
      res.setHeader("Content-Type", response.headers["content-type"]);
      response.data.pipe(res);
    }
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
