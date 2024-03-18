const { spawn } = require("child_process");

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
      const durationInSeconds = parseFloat(data.toString());
      resolve(durationInSeconds);
    });

    ffprobe.stderr.on("data", (data) => {
      reject(data.toString());
    });
  });
};

module.exports = getAudioDuration;
