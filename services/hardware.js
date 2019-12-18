const five = require("johnny-five");
const config = require("../config").pins;
const board = new five.Board();

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

let announced = false;

function monitorWatering(watered) {
  let lastMeasurement = 100;
  const pauseAnnouncements = () => {
    announced = true;
    setTimeout(() => {
      announced = false;
    }, 30000);
  };
  setInterval(() => {
    if (moisture - lastMeasurement > 5) {
      if (!announced) {
        watered();
        pauseAnnouncements();
      }
    }
    lastMeasurement = moisture;
  }, 3000);
}

function initialise({ watered }) {
  motionSensor = motionSensor || new five.Motion(config.motionSensor);
  lightSensor = lightSensor || new five.Sensor({
    pin: config.lightSensor,
    freq: 1000
  });

  lightSensor.on("change", function () {
    light = this.scaleTo(100, 0);
  });

  moistureSensor = moistureSensor || new five.Sensor({
    pin: config.moistureSensor,
    freq: 1000
  });

  moistureSensor.on("change", function () {
    moisture = this.scaleTo(100, 0);
  });

  monitorWatering(watered);

  thermometer = thermometer || new five.Thermometer({
    pin: config.thermometer,
    freq: 1000,
    controller: "LM35"
  });

  thermometer.on("data", function () {
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
