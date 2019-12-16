# George II

How to install the project on Mac:

- Install (Node.js)[https://nodejs.org/en/download/]
- Install Xcode developer tools: `xcode-select --install`
- Install (Homebrew)[https://brew.sh/]
- Install FFMPEG command line tool: `brew install ffmpeg`
- Install SOX command line tool: `brew install sox`
- Install MPG321 command line tool: `brew install mpg321`
- Setup AWS (config and credentials files)[https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html]
- Setup the MQTT client in AWS and update the config the names and hosts
- Download and add the root-CA.crt file, the .cert.pem, the private.key and the public.key files when you setup the MQTT profile
- Add a set of pictures for AWS Rekognition to be able to recognise people and add the name of this collection to the config.js
- Setup AWS Lex and updated the config.js
- Build the Arduino circuit and adjust the pin numbers in the config.js

How to run the project:

- `npm install`
- `node george.js`
