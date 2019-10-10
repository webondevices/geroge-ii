const config = require("./config");
const mqtt = require("./services/mqtt");
const hardware = require("./services/hardware");
const lex = require("./services/lex");

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
}

hardware.board.on("ready", initialise);
