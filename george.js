const config = require("./config");
const camera = require("./services/camera");
const rekognition = require("./services/rekognition");
const polly = require("./services/polly");
const mqtt = require("./services/mqtt");
const hardware = require("./services/hardware");
const lex = require("./services/lex");
const robot = require("./services/robot");

let motionSensorEnabled = true;
let buttonEnabled = true;

const stringWithArticle = s => (['a', 'e', 'i', 'o', 'u'].includes(s[0].toLowerCase()) ? `an ${s}` : `a ${s}`);

async function motionHandler() {
  if (motionSensorEnabled) {
    await robot.findAndGreetPerson();
    await robot.interpretSensors();
    await interpretSurroundings();

    motionSensorEnabled = false;
    setTimeout(() => {
      motionSensorEnabled = true;
    }, 60 * 1000);
  }
}

async function interpretSurroundings() {
  const imageFile = await camera.captureImage(config.imageSettings);
  const labels = await rekognition.detectLabels(imageFile);
  const labelsToIgnore = ["person", "face", "head", "portrait", "photography", "man", "female", "woman", "child"];
  const filteredLabels = labels.Labels.filter(label => !labelsToIgnore.includes(label.Name.toLowerCase())).slice(0, config.rekognition.LabelsToSay);
  await polly.speak(`I can see ${stringWithArticle(filteredLabels[0].Name)}, ${stringWithArticle(filteredLabels[1].Name)} and ${stringWithArticle(filteredLabels[2].Name)}.`);
}

async function tellFacialFeature(template) {
  const imageFile = await camera.captureImage(config.imageSettings);
  const facialFeatures = await robot.findFacialFeaturesOnImage(imageFile);
  await polly.speak(template(facialFeatures));
}

const messageHandler = {
  tellAge: async () => {
    await tellFacialFeature(f => `The youngest you could be is ${f.ageLow} years old but ${f.ageHigh} is also realistic. My guess is ${f.age}!`);
  },
  tellSex: async () => {
    await tellFacialFeature(f => `I think you are a ${f.gender}!`);
  },
  tellMood: async () => {
    await tellFacialFeature(f => `You look ${f.emotion}!`);
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
    await polly.speak(`I am ${stringWithArticle(config.kind)}.`);
  },
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
    buttonEnabled = false;

    if (buttonEnabled) {
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
