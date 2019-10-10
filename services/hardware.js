const five = require("johnny-five");
const board = new five.Board();
const config = require("../config");

let button;
let redLed;
let yellowLed;
let greenLed;
let thermometer;
let lightSensor;
let motionSensor;
let moistureSensor;

function initialise() {
  motionSensor = motionSensor || new five.Motion(config.pins.motionSensor);
  lightSensor =
    lightSensor ||
    new five.Sensor({
      pin: config.pins.lightSensor,
      freq: 250
    });
  moistureSensor =
    moistureSensor ||
    new five.Sensor({
      pin: config.pins.moistureSensor,
      freq: 250
    });
  thermometer =
    thermometer ||
    new five.Thermometer({
      pin: config.pins.thermometer,
      controller: "LM35"
    });

  button = button || new five.Button(config.pins.button);
  redLed = redLed || new five.Led(config.pins.redLed);
  yellowLed = yellowLed || new five.Led(config.pins.yellowLed);
  greenLed = greenLed || new five.Led(config.pins.greenLed);
}

module.exports = {
  five,
  board,
  initialise,
  get button() {
    return button;
  },
  get redLed() {
    return redLed;
  },
  get yellowLed() {
    return yellowLed;
  },
  get greenLed() {
    return greenLed;
  },
  get thermometer() {
    return thermometer;
  },
  get lightSensor() {
    return lightSensor;
  },
  get motionSensor() {
    return motionSensor;
  },
  get moistureSensor() {
    return moistureSensor;
  }
};
