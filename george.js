const config = require("./config");
const camera = require("./services/camera");
const polly = require("./services/polly");
const mqtt = require("./services/mqtt");
const hardware = require("./services/hardware");
const lex = require("./services/lex");
const robot = require("./services/robot");

let enabled = true;

async function motionHandler() {
  if (enabled) {
    await robot.findAndGreetPerson();
    await robot.interpretSensors();
    // await interpretSurroundings();

    enabled = false;
    setTimeout(() => {
      enabled = true;
    }, 60 * 1000);
  }
}

async function tellFacialFeature(template) {
  const imageFile = await camera.captureImage(config.imageSettings);
  const facialFeatures = await robot.findFacialFeaturesOnImage(imageFile);
  await polly.speak(template(facialFeatures));
}

const messageHandler = {
  interpretSurroundings: () => {
    console.log("robot.interpretSurroundings()");
  },
  tellAge: async () => {
    await tellFacialFeature(f => `The youngest you could be is ${f.ageLow} years old but ${f.ageHigh} is also realistic. My guess is ${f.age}!`);
  },
  tellSex: async () => {
    await tellFacialFeature(f => `I think you are a ${f.gender}!`);
  },
  tellMood: async () => {
    await tellFacialFeature(f => `You look ${f.emotion}!`);
  }
};

async function initialise() {
  // Subscribe to MQTT topic
  mqtt.subscribe(config.mqtt.topic, messageHandler);

  // Set up hardware pins
  hardware.initialise();
  hardware.greenLed.on();

  // When button pressed, listen for commands
  hardware.button.on("down", function () {
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

  // When motion detected, handle it
  // hardware.motionSensor.on("motionstart", motionHandler);
}

hardware.board.on("ready", initialise);
