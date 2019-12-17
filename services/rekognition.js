const AWS = require("aws-sdk");
const fs = require("fs-extra");
const config = require("../config").rekognition;

const rekognition = new AWS.Rekognition({ region: config.region });

function findPerson(imagePath) {
  const bitmap = fs.readFileSync(imagePath);

  return new Promise((resolve, reject) => {
    rekognition
      .searchFacesByImage({
        CollectionId: config.collectionName,
        FaceMatchThreshold: config.FaceMatchThreshold,
        Image: {
          Bytes: bitmap
        },
        MaxFaces: config.MaxFaces
      })
      .promise()
      .then(faces => {
        if (faces.hasOwnProperty("FaceMatches")) {
          resolve(faces.FaceMatches[0].Face);
        } else {
          reject("No face found in image.");
        }
      })
      .catch(error => {
        reject(`Error when processing image. ${error}`);
      });
  });
}

function getFacialFeatures(imagePath) {
  const bitmap = fs.readFileSync(imagePath);

  return new Promise((resolve, reject) => {
    rekognition
      .detectFaces({
        Image: {
          Bytes: bitmap
        },
        Attributes: ["ALL"]
      })
      .promise()
      .then(result => {
        if (result.hasOwnProperty("FaceDetails")) {
          resolve(result.FaceDetails[0]);
        } else {
          reject("No faces found in image.");
        }
      })
      .catch(error => {
        reject(`Error when processing image. ${error}`);
      });
  });
}

function detectLabels(imagePath) {
  const bitmap = fs.readFileSync(imagePath);

  return new Promise((resolve, reject) => {
    rekognition
      .detectLabels({
        Image: {
          Bytes: bitmap
        },
        MaxLabels: config.MaxLabels,
        MinConfidence: config.MinConfidence
      })
      .promise()
      .then(resolve)
      .catch(reject);
  });
}

function getStrongestEmotion(emotionsArray) {
  const confidences = emotionsArray.map(emotion => emotion.Confidence);
  const highestConfidence = Math.max(...confidences);
  const strongestEmotion = emotionsArray.find(
    emotion => emotion.Confidence === highestConfidence
  );

  return strongestEmotion.Type;
}

function processFacialFeatures(facialFeatures) {
  return {
    age: parseInt(
      (facialFeatures.AgeRange.Low + facialFeatures.AgeRange.High) / 2
    ),
    ageLow: facialFeatures.AgeRange.Low,
    ageHigh: facialFeatures.AgeRange.High,
    gender: facialFeatures.Gender.Value.toLowerCase(),
    emotion: getStrongestEmotion(facialFeatures.Emotions).toLowerCase()
  };
}

module.exports = {
  findPerson,
  getFacialFeatures,
  processFacialFeatures,
  detectLabels,
};
