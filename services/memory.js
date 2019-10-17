const fs = require("fs-extra");
const memoryFile = "./services/memory.json";

function openMemory() {
  return new Promise((resolve, reject) => {
    fs.readJson(memoryFile)
      .then(resolve)
      .catch(error => reject(`Error reading memory file. ${error}`));
  });
}

function remember(newInfo) {
  return new Promise((resolve, reject) => {
    openMemory().then(existingMemory => {
      fs.writeJson(memoryFile, { ...existingMemory, ...newInfo })
        .then(resolve)
        .catch(error => reject(`Error writing memory file. ${error}`));
    });
  });
}

function recall(key) {
  return new Promise((resolve, reject) => {
    openMemory()
      .then(memory => {
        if (memory.hasOwnProperty(key)) {
          resolve(memory[key]);
        } else {
          reject("Key not found in memory.");
        }
      })
      .catch(reject);
  });
}

module.exports = {
  remember,
  recall
};
