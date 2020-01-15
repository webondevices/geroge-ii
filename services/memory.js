const fs = require("fs-extra");
const memoryFile = "./services/memory.json";
const e = require("../services/error");

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

async function getTimeLastSeenPerson(name) {
  try {
    const memoryLocation = `${name}-seen`;
    const now = Date.now();
    const dateMemory = await recall(memoryLocation);
    const personLastSeen = new Date(dateMemory);
    const diffTime = Math.abs(now - personLastSeen.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error(e.rememberPerson, error);
    return false;
  }
};

async function savePersonLastSeen(name) {
  try {
    const memoryLocation = `${name}-seen`;
    return await remember({ [memoryLocation]: Date.now() });
  } catch (error) {
    console.error(e.savePerson, error);
    return false;
  }
}

module.exports = {
  remember,
  recall,
  getTimeLastSeenPerson,
  savePersonLastSeen
};
