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
        reject("Error when processing image.");
      });
  });
}

module.exports = {
  findPerson
};
