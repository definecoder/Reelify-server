const { getFile, deleteFile } = require("../services/aws/file-server");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const getFileFromAWS = async (req, res) => {
  try {
    // check if the file exists, if so then send the file

    const root = __dirname + "/../";

    let filePath = root + req.params.fileName;
    filePath = path.resolve(filePath);

    console.log(filePath);
    if (fs.existsSync(filePath)) {
      console.log("file exists...");

      console.log(filePath);

      res.sendFile(filePath);

      return;
    } else {
      const url = await getFile(req.params.fileName);
      const response = await axios.get(url, { responseType: "stream" });
      // save the file to the server
      const file = fs.createWriteStream(req.params.fileName);
      response.data.pipe(file);
      res.setHeader("Content-Type", response.headers["content-type"]);
      response.data.pipe(res);
    }

    // const url = await getFile(req.params.fileName);

    // const response = await axios.get(url, { responseType: "stream" });

    // // save the file to the server
    // const file = fs.createWriteStream(req.params.fileName + ".mp4");
    // response.data.pipe(file);

    // res.setHeader("Content-Type", response.headers["content-type"]);
    // response.data.pipe(res);
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
