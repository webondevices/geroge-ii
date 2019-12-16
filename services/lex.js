const AWS = require("aws-sdk");
const fs = require("fs");
const exec = require("child_process").exec;
const config = require("../config").lex;

const FULFILLED = "Fulfilled";
const RESPONSE_FILE = "response.mpeg";
const REQUEST_FILE = "request.wav";
const SOX_COMMAND = `sox -d -t wavpcm -c 1 -b 16 -r 16000 -e signed-integer --endian little - silence 1 0 2% 5 0.3t 4% > ${REQUEST_FILE}`;
const lexruntime = new AWS.LexRuntime({
  region: config.region
});

const sendRequest = function (resolve, reject) {
  const inputStream = fs.readFileSync(`./${REQUEST_FILE}`);
  const { botAlias, botName, userId, contentType } = config;

  const params = {
    botAlias,
    botName,
    userId,
    contentType,
    inputStream
  };

  lexruntime.postContent(params, (err, data) => {
    if (err) {
      reject(err);
    } else {
      fs.writeFile(RESPONSE_FILE, data.audioStream, err => {
        if (err) {
          reject(err);
        }
      });

      console.log("Playing response...");
      const playback = exec(`mpg321 ${RESPONSE_FILE}`);
      playback.on("close", () => {
        exec(`rm ${RESPONSE_FILE}`);
        exec(`rm ${REQUEST_FILE}`);

        if (data.dialogState !== FULFILLED) {
          listen();
        } else {
          resolve();
        }
      });
    }
  });
};

const listen = function () {
  return new Promise((resolve, reject) => {
    const recording = exec(SOX_COMMAND);
    console.log("Listening...");
    recording.on("close", function () {
      console.log("Sending...");
      sendRequest(resolve, reject);
    });
  });
};

module.exports = { listen };
