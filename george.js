const config = require("./config");
const mqtt = require("./services/mqtt");
const hardware = require("./services/hardware");
const lex = require("./services/lex");
const camera = require("./services/camera");
const rekognition = require("./services/rekognition");
const memory = require("./services/memory");
const polly = require("./services/polly");
const u = require("./services/utterances");
const e = require("./services/error");

let enabled = true;

async function interpretSensors() {
  const { temperature, moisture, light } = hardware;
  try {
    // Temperature
    if (temperature < 16) {
      await polly.speak(u.complain.cold(temperature));
    }

    if (temperature > 21) {
      await polly.speak(u.complain.hot(temperature));
    }

    // Soil
    if (moisture > 40) {
      await polly.speak(u.complain.wet());
    }

    if (moisture < 10) {
      await polly.speak(u.complain.dry());
    }

    // Light
    if (light < 60 && light > 30) {
      await polly.speak(u.complain.dim());
    }

    if (light <= 30) {
      await polly.speak(u.complain.dark());
    }
  } catch (error) {
    console.error(e.speak, error);
  }
}

async function recallPerson(name) {
  let memoryLocation, diffDays;
  let remember = false;

  try {
    memoryLocation = `${name}-seen`;
    const now = Date.now();
    const dateMemory = await memory.recall(memoryLocation);
    remember = true;
    const personLastSeen = new Date(dateMemory);
    const diffTime = Math.abs(now - personLastSeen.getTime());
    diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error(e.rememberPerson, error);
  }

  try {
    if (remember) {
      if (diffDays > 0) {
        await polly.speak(u.say.notSeen(diffDays));
      } else {
        await polly.speak(u.say.seen());
      }
    } else {
      await polly.speak(u.say.neverSeen());
    }
  } catch (error) {
    console.error(e.speak, error);
  }

  try {
    await memory.remember({ [memoryLocation]: Date.now() });
  } catch (error) {
    console.error(e.savePerson, error);
  }
}

async function findPersonOnCamera() {
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
  } catch (error) {
    console.error(e.findPerson, error);
  }

  if (name) {
    try {
      await polly.speak(
        `Hello ${name}! You look ${emotion}, you are a ${gender} and you look to be ${age} years old.`
      );
    } catch (error) {
      console.error(e.speak, error);
    }

    await recallPerson(name);
  }
}

async function tellAge() {
  try {
    const imageFile = await camera.captureImage(config.imageSettings);
    const facialFeatures = await rekognition.getFacialFeatures(imageFile);
    const processedFeatures = rekognition.processFacialFeatures(facialFeatures);

    await polly.speak(`Let me see. The youngest you could be is ${processedFeatures.ageLow} years old but ${processedFeatures.ageHigh} is also realistic. My guess is ${processedFeatures.age}!`);
  } catch (error) {
    await polly.speak(u.say.cantSee);
  }
}

async function tellSex() {
  try {
    const imageFile = await camera.captureImage(config.imageSettings);
    const facialFeatures = await rekognition.getFacialFeatures(imageFile);
    const processedFeatures = rekognition.processFacialFeatures(facialFeatures);

    await polly.speak(`I think you are a ${processedFeatures.gender}!`);
  } catch (error) {
    await polly.speak(u.say.cantSee);
  }
}

async function tellMood() {
  try {
    const imageFile = await camera.captureImage(config.imageSettings);
    const facialFeatures = await rekognition.getFacialFeatures(imageFile);
    const processedFeatures = rekognition.processFacialFeatures(facialFeatures);

    await polly.speak(`You look ${processedFeatures.emotion}!`);
  } catch (error) {
    await polly.speak(u.say.cantSee);
  }
}

async function motionHandler() {
  if (enabled) {
    await findPersonOnCamera();
    await interpretSensors();
    // await interpretSurroundings();

    enabled = false;
    setTimeout(() => {
      enabled = true;
    }, 60 * 1000);
  }
}

const messageHandler = {
  interpretSurroundings: () => {
    console.log("robot.interpretSurroundings()");
  },
  tellAge: async () => {
    await tellAge();
  },
  tellSex: () => {
    await tellSex();
  },
  tellMood: () => {
    await tellMood();
  }
};

async function initialise() {
  // Subscribe to MQTT topic
  mqtt.subscribe(config.mqtt.topic, messageHandler);

  // Set up hardware pins
  hardware.initialise();
  hardware.greenLed.on();

  // When button pressed, listen to commands
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
  hardware.motionSensor.on("motionstart", motionHandler);
}

hardware.board.on("ready", initialise);
