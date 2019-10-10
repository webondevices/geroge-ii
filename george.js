const config = require("./config");
const mqtt = require("./services/mqtt");

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

function initialise() {
  // Subscribe to MQTT topic
  mqtt.subscribe(config.mqtt.topic, messageHandler);
}

initialise();
