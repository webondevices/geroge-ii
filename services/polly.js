const AWS = require("aws-sdk");
const fs = require("fs");
const player = require("play-sound")({});
const config = require("./../config");

const Polly = new AWS.Polly({
  signatureVersion: "v4",
  region: config.rekognition.region
});

const speechFile = "speech.mp3";

function playFile(resolve, reject) {
  player.play(`./${speechFile}`, error => {
    if (error) {
      reject("Error playing response file.", error);
    } else {
      resolve();
    }
  });
}

async function speak(text) {
  let params = {
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Kimberly"
  };

  return new Promise((resolve, reject) => {
    Polly.synthesizeSpeech(params, (error, data) => {
      if (error) {
        reject("Error synthesizing speech.", error);
      }

      if (data && data.AudioStream instanceof Buffer) {
        fs.writeFile(`./${speechFile}`, data.AudioStream, error => {
          if (error) {
            reject("Error writing response file to disk.", error);
          }
          playFile(resolve, reject);
        });
      }
    });
  });
}

module.exports = { speak };
