module.exports = {
  age: "6 months",
  kind: "spider plant",
  rekognition: {
    collectionName: "FamilyFaces",
    region: "us-east-1",
    FaceMatchThreshold: 80,
    MaxFaces: 1,
    MaxLabels: 30,
    MinConfidence: 10,
    LabelsToSay: 3,
  },
  mqtt: {
    keyPath: "roppyTheRobot.private.key",
    certPath: "roppyTheRobot.cert.pem",
    caPath: "root-CA.crt",
    clientId: "roppyTheRobot",
    host: "a1dofbbl9cybm6.iot.eu-west-2.amazonaws.com",
    topic: "roppyControl"
  },
  lex: {
    region: "us-east-1",
    botAlias: "$LATEST",
    botName: "roppySmartRobot",
    userId: "user",
    contentType: "audio/l16; rate=16000; channels=1"
  },
  get imageSettings() {
    return {
      size: "640x480",
      fileName: Date.now() + ".jpg",
      environment: "mac"
    };
  },
  pins: {
    redLed: 9,
    yellowLed: 5,
    greenLed: 6,
    button: 2,
    motionSensor: 8,
    lightSensor: "A0",
    thermometer: "A1",
    moistureSensor: "A2"
  }
};
