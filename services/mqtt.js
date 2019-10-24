const deviceModule = require("aws-iot-device-sdk").device;
const config = require("../config").mqtt;

function handleNewMessage(topic, payload, messageHandler) {
  console.log("Message received:", topic, JSON.parse(payload));

  if (topic === config.topic) {
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
    keyPath: config.keyPath,
    certPath: config.certPath,
    caPath: config.caPath,
    clientId: config.clientId,
    host: config.host
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
