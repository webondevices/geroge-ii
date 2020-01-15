function random(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

module.exports = {
  complain: {
    cold: temp =>
      random([
        "It's really cold in here!",
        `It's really cold in here! It's only ${temp} degrees in here.`,
        `Can you turn up the heating! It's ${temp} degrees in here.`,
        "Have you left the window open? It's freezing.",
        `The temperature is ${temp} degrees here. I'm really cold.`
      ]),
    hot: temp =>
      random([
        "It's really hot in here!",
        `It's really hot in here! It's ${temp} degrees in here.`,
        `Can you open the windows! It's ${temp} degrees in here.`,
        "Have you left the heating on? It's boiling in here.",
        `The temperature is ${temp} degrees here. I'm sweating.`
      ]),
    dry: () =>
      random([
        "My soil is really dry and I'm really thirsty. Can I have some water?",
        "My soil is dry. Can you water me please?",
        "Some water please. I'm really thirsty!",
        "I've not been watered for a long time. Please water me!",
        "My soil needs some water."
      ]),
    wet: () =>
      random([
        "My soil is soaking wet! I don't need more water.",
        "My soil is too wet.",
        "I have too much water in my pot.",
        "I think you overwatered me. My soil is too wet.",
        "My soil has a bit too much water in it. Please put less water next time."
      ]),
    dim: () =>
      random([
        "It's getting dark in here. Can you put me closer to the window?",
        "It's a bit dark.",
        "It's getting a bit dark now. Can you switch the lights on.",
        "Switch the lights on. It's getting dark now.",
        "Put me closer to the window. It's getting dark in here."
      ]),
    dark: () =>
      random([
        "It's really dark in here. Can you put me closer to the window?",
        "It's really dark now.",
        "It's getting really dark now. Can you switch the lights on.",
        "Switch the lights on, please. It's getting really dark now.",
        "Put me closer to the window. It's getting really dark in here."
      ])
  },
  say: {
    notSeen: diffDays =>
      random([
        `I haven't seen you in ${diffDays} days.`,
        `It's been ${diffDays} days since I last saw you.`,
        `Long time, no see. It's been ${diffDays} days.`
      ]),
    seen: () =>
      random([
        "I've already seen you today!",
        "Hey! You've been here today!",
        "I have seen you today!"
      ]),
    neverSeen: () =>
      random([
        "I have never seen you before.",
        "This is the first I saw you.",
        "Hello stranger. Nice to meet you!"
      ]),
    cantSee: () =>
      random([
        "Sorry! I can't see a person.",
        "I'm sorry! I can't find a face to analyse.",
        "Sorry! I'm unable to find a person to analyse."
      ]),
    bright: () =>
      random([
        "It's nice and bright here!",
        "There's plenty of light here!",
        "I have enough light!"
      ]),
    warm: () =>
      random([
        "The temperature is just perfect!",
        "The temperature is just right!",
        "I'm happy with the temperature!"
      ]),
    moist: () =>
      random([
        "My soil is moist enough. I need no more water!",
        "My soil is nice and moist. Thank you!",
        "My soild is just perfect. I was watered recently!"
      ]),
  }
};
