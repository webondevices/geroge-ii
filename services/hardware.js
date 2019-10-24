const five = require("johnny-five");
const board = new five.Board();
const config = require("../config").pins;

let button;
let redLed;
let yellowLed;
let greenLed;

let thermometer;
let lightSensor;
let motionSensor;
let moistureSensor;

let temperature = 0;
let moisture = 0;
let light = 0;

function initialise() {
  motionSensor = motionSensor || new five.Motion(config.motionSensor);
  lightSensor =
    lightSensor ||
    new five.Sensor({
      pin: config.lightSensor,
      freq: 250
    });

  lightSensor.on("change", function() {
    light = this.scaleTo(100, 0);
  });

  moistureSensor =
    moistureSensor ||
    new five.Sensor({
      pin: config.moistureSensor,
      freq: 250
    });

  moistureSensor.on("change", function() {
    moisture = this.scaleTo(100, 0);
  });

  thermometer =
    thermometer ||
    new five.Thermometer({
      pin: config.thermometer,
      controller: "LM35"
    });

  thermometer.on("data", function() {
    temperature = this.C;
  });

  button = button || new five.Button(config.button);
  redLed = redLed || new five.Led(config.redLed);
  yellowLed = yellowLed || new five.Led(config.yellowLed);
  greenLed = greenLed || new five.Led(config.greenLed);
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
  get motionSensor() {
    return motionSensor;
  },
  get temperature() {
    return temperature;
  },
  get light() {
    return light;
  },
  get moisture() {
    return moisture;
  }
};
