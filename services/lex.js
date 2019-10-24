"use strict";

const AWS = require("aws-sdk");
const fs = require("fs");
const exec = require("child_process").exec;
const config = require("../config");

const FULFILLED = "Fulfilled";
const RESPONSE_FILE = "response.mpeg";
const REQUEST_FILE = "request.wav";
const SOX_COMMAND =
  "sudo sox -d -t wavpcm -c 1 -b 16 -r 16000 -e signed-integer --endian little - silence 1 0 2% 5 0.3t 4% > request.wav";
const lexruntime = new AWS.LexRuntime({
  region: config.lex.region
});

const sendRequest = function(resolve, reject) {
  const inputStream = fs.readFileSync(`./${REQUEST_FILE}`);
  const { botAlias, botName, userId, contentType } = config.lex;

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
      console.log("writing response file");
      fs.writeFile(RESPONSE_FILE, data.audioStream, err => {
        if (err) {
          reject(err);
        }
      });

      console.log("received response, playing...");

      const playback = exec(`sudo mpg321 ${RESPONSE_FILE}`);
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

const listen = function() {
  return new Promise((resolve, reject) => {
    const recording = exec(SOX_COMMAND);
    console.log("rec");
    recording.on("close", function() {
      console.log("over, interpret");
      sendRequest(resolve, reject);
    });
  });
};

module.exports = { listen };