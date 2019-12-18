const config = require("./config");
const camera = require("./services/camera");
const rekognition = require("./services/rekognition");
const polly = require("./services/polly");
const mqtt = require("./services/mqtt");
const hardware = require("./services/hardware");
const lex = require("./services/lex");
const robot = require("./services/robot");
const helpers = require("./services/helpers");
const memory = require("./services/memory");
const u = require("./services/utterances");

let motionSensorEnabled = true;
let buttonEnabled = true;

async function getFilteredLabels() {
  const imageFile = await camera.captureImage(config.imageSettings);
  const detectedLabels = await rekognition.detectLabels(imageFile);
  const filteredLabels = rekognition.getImportantLabels(detectedLabels);
  return filteredLabels;
}

async function interpretSurroundings() {
  const filteredLabels = await getFilteredLabels();
  const labels = filteredLabels.map(l => helpers.stringWithArticle(l));
  await polly.speak(`I can see ${labels[0]}, ${labels[1]} and ${labels[2]}.`);
}

async function getFacialFeatures() {
  const imageFile = await camera.captureImage(config.imageSettings);
  const facialFeatures = await robot.findFacialFeaturesOnImage(imageFile);
  return facialFeatures;
}

async function motionHandler() {
  if (motionSensorEnabled) {
    motionSensorEnabled = false;

    await robot.findAndGreetPerson();
    await robot.interpretSensors();

    const objects = await getFilteredLabels();
    const interestingObjects = config.rekognition.interestingLabels;
    const interestingObjectIndex = objects.findIndex(o => interestingObjects.includes(o));
    if (hardware.moisture < 10 && interestingObjectIndex > -1) {
      await polly.speak(`I can see a ${objects[interestingObjectIndex]}. My soil is really dry, can you water me please?`);
    }
    setTimeout(() => {
      motionSensorEnabled = true;
    }, 60 * 1000);
  }
}

const messageHandler = {
  recogniseMe: async () => {
    const imageFile = await camera.captureImage(config.imageSettings);
    const name = await robot.recognisePersonOnPhoto(imageFile);
    const lastSeenInDays = await memory.getTimeLastSeenPerson(name);

    if (name) {
      await polly.speak(`Yes, I recognise you. You're name is ${name === "mate" ? "maahtei" : name}!`);
      if (lastSeenInDays > 0) {
        await polly.speak(u.say.notSeen(lastSeenInDays));
      } else {
        await polly.speak(u.say.seen());
      }
    } else {
      await polly.speak(`I don't recognise you. ${u.say.neverSeen()}`);
    }
  },
  tellAge: async () => {
    const f = await getFacialFeatures();
    await polly.speak(`The youngest you could be is ${f.ageLow} years old but ${f.ageHigh} is also realistic. My guess is ${f.age}!`);
  },
  tellSex: async () => {
    const f = await getFacialFeatures();
    await polly.speak(`I think you are a ${f.gender}!`);
  },
  tellMood: async () => {
    const f = await getFacialFeatures();
    await polly.speak(`You look ${f.emotion}!`);
  },
  interpretSurroundings: async () => {
    await interpretSurroundings();
  },
  tellTemperature: async () => {
    await polly.speak(`It is ${hardware.temperature} celsius here.`);
  },
  tellTemperatureComfort: async () => {
    await robot.interpretTemperature(true);
  },
  tellSoilComfort: async () => {
    await robot.interpretSoil(true);
  },
  tellLightComfort: async () => {
    await robot.interpretLight(true);
  },
  tellOwnAge: async () => {
    await polly.speak(`I am ${config.age} old.`);
  },
  tellOwnKind: async () => {
    await polly.speak(`I am ${helpers.stringWithArticle(config.kind)}.`);
  },
};

async function initialise() {
  // Subscribe to MQTT topic
  mqtt.subscribe(config.mqtt.topic, messageHandler);

  // Watered callback
  const watered = async () => {
    const imageFile = await camera.captureImage(config.imageSettings);
    const name = await robot.recognisePersonOnPhoto(imageFile);

    if (name) {
      await polly.speak(`Thank you for watering me ${name === "mate" ? "maahtei" : name}! I really needed that water, my soil was really dry!`);
    } else {
      await polly.speak(`Thank you stranger for watering me! That water is really refreshing!`);
    }
  };

  // Set up hardware pins
  hardware.initialise({ watered });
  hardware.greenLed.on();

  // When button pressed, listen for commands
  hardware.button.on("down", function () {
    hardware.redLed.blink(250);
    hardware.greenLed.off();

    if (buttonEnabled) {
      buttonEnabled = false;
      lex
        .listen()
        .then(() => {
          hardware.redLed.stop().off();
          hardware.greenLed.on();
          buttonEnabled = true;
        })
        .catch(console.error);
    }
  });

  // When motion detected, handle it
  hardware.motionSensor.on("motionstart", motionHandler);
}

hardware.board.on("ready", initialise);
