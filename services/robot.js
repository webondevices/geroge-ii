const config = require("../config");
const camera = require("../services/camera");
const hardware = require("../services/hardware");
const rekognition = require("../services/rekognition");
const memory = require("../services/memory");
const polly = require("../services/polly");
const u = require("../services/utterances");
const e = require("../services/error");

async function interpretTemperature(verbose) {
  const { temperature } = hardware;

  if (temperature < 16) {
    await polly.speak(u.complain.cold(temperature));
  }

  if (temperature > 21) {
    await polly.speak(u.complain.hot(temperature));
  }

  if (temperature >= 16 && temperature <= 21 && verbose) {
    await polly.speak(u.say.warm());
  }
}

async function interpretLight(verbose) {
  const { light } = hardware;

  if (light < 60 && light > 30) {
    await polly.speak(u.complain.dim());
  }

  if (light <= 30) {
    await polly.speak(u.complain.dark());
  }

  if (light > 60 && verbose) {
    await polly.speak(u.say.bright());
  }
}

async function interpretSoil(verbose) {
  const { moisture } = hardware;
  if (moisture > 40) {
    await polly.speak(u.complain.wet());
  }

  if (moisture < 10) {
    await polly.speak(u.complain.dry());
  }

  if (moisture >= 10 && moisture <= 40 && verbose) {
    await polly.speak(u.say.moist());
  }
}

async function interpretSensors() {
  interpretTemperature(false);
  interpretLight(false);
  interpretSoil(false);
}

async function findFacialFeaturesOnImage(imageFile) {
  try {
    const facialFeatures = await rekognition.getFacialFeatures(imageFile);
    return rekognition.processFacialFeatures(facialFeatures);
  } catch (error) {
    console.error(e.findPerson, error);
    return false;
  }
}

async function recognisePersonOnPhoto(imageFile) {
  try {
    const person = await rekognition.findPerson(imageFile);
    return person.ExternalImageId;
  } catch (error) {
    console.error(e.findPerson, error);
    return false;
  }
}

async function findAndGreetPerson() {
  const imageFile = await camera.captureImage(config.imageSettings);
  const [name, facialFeatures] = await Promise.all([
    recognisePersonOnPhoto(imageFile),
    findFacialFeaturesOnImage(imageFile)
  ]);

  if (name) {
    await polly.speak(`Hello ${name === "mate" ? "maahtei" : name}!`);
  } else {
    await polly.speak(`Hello stranger!`);
  }

  if (facialFeatures) {
    const { age, gender, emotion } = facialFeatures;
    await polly.speak(`You look ${emotion}, you are a ${gender} and you seem to be ${age} years old.`);
  }

  if (name) {
    const lastSeenInDays = memory.getTimeLastSeenPerson(name);

    if (lastSeenInDays === false) {
      await polly.speak(u.say.neverSeen());
    } else {
      if (lastSeenInDays > 0) {
        await polly.speak(u.say.notSeen(lastSeenInDays));
      } else {
        await polly.speak(u.say.seen());
      }
    }

    memory.savePersonLastSeen(name);
  }
}

module.exports = {
  interpretLight,
  interpretSoil,
  interpretTemperature,
  interpretSensors,
  recognisePersonOnPhoto,
  findFacialFeaturesOnImage,
  findAndGreetPerson,
};