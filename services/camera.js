const exec = require("child_process").exec;

async function captureImage(settings) {
  return new Promise((resolve, reject) => {
    const sizes = settings.size.split("x");
    let command = "";

    if (settings.environment === "mac") {
      command = `ffmpeg -f avfoundation -video_size ${settings.size} -framerate 30 -i "0" -vframes 1 ${settings.fileName}`;
    }

    if (settings.environment === "pi") {
      command = `raspistill -o ${settings.fileName} --width ${
        sizes[0]
      } --height ${sizes[1]} --timeout 500`;
    }

    exec(command, error => {
      if (error) {
        reject("Error when capturing image.", error);
      } else {
        resolve(settings.fileName);
      }
    });
  });
}

module.exports = {
  captureImage
};
