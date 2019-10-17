const config = require("./config");
const mqtt = require("./services/mqtt");
const hardware = require("./services/hardware");
const lex = require("./services/lex");
const camera = require("./services/camera");
const rekognition = require("./services/rekognition");
const memory = require("./services/memory");

const messageHandler = {
  interpretSurroundings: () => {
    console.log("robot.interpretSurroundings()");
  },
  tellAge: () => {
    console.log("robot.tellAge()");
  },
  tellSex: () => {
    console.log("robot.tellSex()");
  },
  tellMood: () => {
    console.log("robot.tellMood()");
  }
};

async function recallPerson(name) {
  let memoryLocation;

  try {
    memoryLocation = `${name}-seen`;
    const now = Date.now();
    const dateMemory = await memory.recall(memoryLocation);
    const personLastSeen = new Date(dateMemory);
    const diffTime = Math.abs(now - personLastSeen.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      console.log(`I haven't seen you in ${diffDays} days.`);
    } else {
      console.log(`I've already seen you today!`);
    }
  } catch (error) {
    console.log("Unable to remember person. ", error);
  }

  try {
    await memory.remember({ [memoryLocation]: Date.now() });
  } catch (error) {
    console.log("Unable to save person in memory.", error);
  }
}

async function interpretCamera() {
  let name, age, gender, emotion;

  try {
    const imageFile = await camera.captureImage(config.imageSettings);
    const person = await rekognition.findPerson(imageFile);
    const facialFeatures = await rekognition.getFacialFeatures(imageFile);
    const processedFeatures = rekognition.processFacialFeatures(facialFeatures);

    name = person.ExternalImageId;
    age = processedFeatures.age;
    gender = processedFeatures.gender;
    emotion = processedFeatures.emotion;

    console.log(
      `Hello ${name}! You look ${emotion}, you are a ${gender} and you look to be ${age} years old.`
    );

    recallPerson(name);
  } catch (error) {
    console.log("Unable to find a person. ", error);
  }
}

function motionHandler() {
  let enabled = true;

  if (enabled) {
    interpretCamera();

    enabled = false;
    setTimeout(() => {
      enabled = true;
    }, 15 * 1000);
  }
}

function initialise() {
  // Subscribe to MQTT topic
  mqtt.subscribe(config.mqtt.topic, messageHandler);

  // Set up hardware pins
  hardware.initialise();
  hardware.greenLed.on();

  // When button pressed, listen to commands
  hardware.button.on("down", function() {
    hardware.redLed.blink(250);
    hardware.greenLed.off();

    lex
      .listen()
      .then(() => {
        hardware.redLed.stop().off();
        hardware.greenLed.on();
      })
      .catch(console.error);
  });

  // When motion detected, interpret camera image
  hardware.motionSensor.on("motionstart", motionHandler);
}

hardware.board.on("ready", initialise);
