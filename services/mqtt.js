const deviceModule = require("aws-iot-device-sdk").device;
const config = require("../config");

function handleNewMessage(topic, payload, messageHandler) {
  console.log("Message received:", topic, JSON.parse(payload));

  if (topic === config.mqtt.topic) {
    const parsedLoad = JSON.parse(payload);
    const command = parsedLoad.command;

    if (messageHandler.hasOwnProperty(command)) {
      messageHandler[command]();
    } else {
      console.error("Command not recognised:", command);
    }
  } else {
    console.error("Topic not recognised:", command);
  }
}

function subscribe(subscriptionTopic, messageHandler) {
  const device = deviceModule({
    keyPath: config.mqtt.keyPath,
    certPath: config.mqtt.certPath,
    caPath: config.mqtt.caPath,
    clientId: config.mqtt.clientId,
    host: config.mqtt.host
  });

  device.subscribe(subscriptionTopic);
  console.log("Subscribing to:", subscriptionTopic);

  device.on("message", (topic, payload) =>
    handleNewMessage(topic, payload, messageHandler)
  );
}

module.exports = {
  subscribe
};
