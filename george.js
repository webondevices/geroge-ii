const config = require("./config");
const mqtt = require("./services/mqtt");
const hardware = require("./services/hardware");
const lex = require("./services/lex");
const camera = require("./services/camera");
const rekognition = require("./services/rekognition");
const memory = require("./services/memory");
const polly = require("./services/polly");

async function interpretSensors() {
  const { temperature, moisture, light } = hardware;

  try {
    // Temperature
    if (temperature < 16) {
      await polly.speak("It's really cold in here!");
    }

    if (temperature > 21) {
      await polly.speak(
        `It's boiling hot in here! It's ${temperature} degrees.`
      );
    }

    // Soil
    if (moisture > 40) {
      await polly.speak("My soil is soaking wet! I don't need more water.");
    }

    if (moisture < 10) {
      await polly.speak(
        "My soil is really dry and I'm really thirsty. Can I have some water?"
      );
    }

    // Light
    if (light < 60 && light > 30) {
      await polly.speak(
        "It's getting dark in here. Can you put me closer to the window?"
      );
    }

    if (light <= 30) {
      await polly.speak(
        "It's really dark in here. Can you switch on the lights?"
      );
    }
  } catch (error) {
    console.error("Unable to speak.", error);
  }
}

async function recallPerson(name) {
  let memoryLocation, diffDays;

  try {
    memoryLocation = `${name}-seen`;
    const now = Date.now();
    const dateMemory = await memory.recall(memoryLocation);
    const personLastSeen = new Date(dateMemory);
    const diffTime = Math.abs(now - personLastSeen.getTime());
    diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error("Unable to remember person.", error);
  }

  try {
    if (diffDays) {
      if (diffDays > 0) {
        await polly.speak(`I haven't seen you in ${diffDays} days.`);
      } else {
        await polly.speak("I've already seen you today!");
      }
    } else {
      await polly.speak("I have never seen you before.");
    }
  } catch (error) {
    console.error("Unable to speak.", error);
  }

  try {
    await memory.remember({ [memoryLocation]: Date.now() });
  } catch (error) {
    console.error("Unable to save person in memory.", error);
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
    console.error("Unable to find a person.", error);
  }

  if (name) {
    try {
      await polly.speak(
        `Hello ${name}! You look ${emotion}, you are a ${gender} and you look to be ${age} years old.`
      );
    } catch (error) {
      console.error("Unable to speak.", error);
    }

    await recallPerson(name);
  }
}

function motionHandler() {
  let enabled = true;

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

async function initialise() {
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

  // When motion detected, handle it
  hardware.motionSensor.on("motionstart", motionHandler);
}

hardware.board.on("ready", initialise);
