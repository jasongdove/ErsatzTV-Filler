const fs = require('fs');
const xml2js = require('xml2js');
const { WORKDIR, FFMPEGCOMMAND, CHANNEL_OFFLINEDIR } = require("../constants/path.constants");
const logger = require("../utils/logger.utils");
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { retrieveCurrentConfiguration } = require("../modules/config-loader.module");
const { selectRandomAudioFile } = require("./utils/randomaudio.utils");
const {themecolourdecoder, retrieveCurrentTheme} = require("../utils/themes.utils");
const path = require('path');
const { listFilesInDir } = require("../utils/file.utils");
const http = require('http')
const { createDirectoryIfNotExists } = require("../utils/file.utils");
const { downloadImage } = require("../utils/downloadimage.utils");

let isFunctionRunning = false;
const CHANNEL_OFFLINE = async () => {
  if (isFunctionRunning) {
  logger.error('Channel Offline Generator is already running.');
    return;
  }
  isFunctionRunning = true;
  createDirectoryIfNotExists(CHANNEL_OFFLINEDIR);
  const config_current = await retrieveCurrentConfiguration();

  async function downloadXmltv(xmltvFilePath) {
    return new Promise((resolve, reject) => {
      http.get(xmltvFilePath, (response) => {
        if (response.statusCode !== 200) {
          // Reject the promise with an error
          reject(new Error(`Failed to download XMLTV. Status code: ${response.statusCode}`));
          return;
        }

        let data = '';

        // Concatenate the received data
        response.on('data', (chunk) => {
          data += chunk;
        });

        // Resolve the promise with the complete data when the request is finished
        response.on('end', () => {
          resolve(data);
          logger.info(data);
          fs.writeFileSync(`${CHANNEL_OFFLINEDIR}/xmltv.xmltv`, data);
        });
      }).on('error', (error) => {
        // Reject the promise with the error
        reject(error);
      });
    });
  }

  // Function to split XMLTV by channel
  const splitXMLTVByChannel = async () => {
    const xmlData = await fs.promises.readFile(`${CHANNEL_OFFLINEDIR}/xmltv.xmltv`, 'utf8');
    xml2js.parseString(xmlData, (parseErr, result) => {
      if (parseErr) {
        logger.error('Error parsing XML:', parseErr);
        return;
      }

      const channels = result.tv.channel;

      channels.forEach(async (channel) => {
        const channelId = channel.$.id;

        const programs = result.tv.programme.filter(program => program.$.channel === channelId);

        const builder = new xml2js.Builder();

        const channelXMLData = {
          tv: {
            channel: [channel],
            programme: programs
          }
        };

        const channelXMLString = builder.buildObject(channelXMLData);
        const channelFilePath = `${CHANNEL_OFFLINEDIR}/${channelId}.xml`;
        logger.info(channelFilePath);
        await fs.promises.writeFile(channelFilePath, channelXMLString);
        logger.info(`Channel file saved: ${channelFilePath}`);
      });
    });
  };

  // Function to find start time
  const startTimefind = async (eachxmltvfile) => {

    const audioFile = await selectRandomAudioFile(config_current.customaudio);
    const current_theme = await retrieveCurrentTheme();
    logger.info(eachxmltvfile);
    try {
      // Read the XML file
      const data = await fs.promises.readFile(`${CHANNEL_OFFLINEDIR}/${eachxmltvfile}.xml`, 'utf-8');

      // Parse the XML
      xml2js.parseString(data, (parseErr, result) => {
        if (parseErr) {
          logger.error('Error parsing XML:', parseErr);
          return;
        }

        const channels = result.tv.channel;
      channels.forEach((channel) => {
        const channelId = channel.$.id;
        const channelLogo = channel.icon && channel.icon[0].$.src;
        downloadImage(`${channelLogo}`, `${CHANNEL_OFFLINEDIR}/${eachxmltvfile}.png`)
            .then(logger.success)
            .catch(logger.error);
      });



        // Extract the show start time
    const showName = 'Channel-Offline'; // Replace with the name of the show you're looking for

    const programme = result.tv.programme.find(program => program.title[0]._ === showName);

logger.info(programme)

      let nextShowName = '';
      let nextStartTime = '';
const index = result.tv.programme.findIndex(program => program.title[0]._ === showName);

if (index !== -1 && index < result.tv.programme.length - 1) {
for (let i = index + 1; i < result.tv.programme.length; i++) {
const nextProgramme = result.tv.programme[i];
nextShowName = nextProgramme.title[0]._;

nextStartTime = nextProgramme.$.start;

if (nextShowName !== showName) {
  break;
}
}
}
logger.info(nextStartTime)
// Extract the time portion from the nextStartTime string
const time = nextStartTime.substr(8, 6);

// Extract hours, minutes, and seconds from the time string
const hours = time.substr(0, 2);
const minutes = time.substr(2, 2);
const seconds = time.substr(4, 2);

// Convert hours to 12-hour format
let formattedHours = parseInt(hours);
formattedHours = formattedHours !== NaN ? (formattedHours % 12) || 12 : '';

// Create the formatted time string
const nextShowStartTime = formattedHours && minutes ? `${formattedHours}:${minutes} ${formattedHours >= 12 ? 'PM' : 'AM'}` : '';



logger.info(nextShowStartTime)

      // Calculate the duration for each subtitle
      const subtitleDuration = 0; // Duration in seconds

      // Calculate the start and end time for each subtitle
      let startTime = 0; // Start time adjusted by 2 seconds
      let endTime = 5;

      // Define the font size and line spacing
      const fontSize = 32;
      const lineSpacing = 1;

      // Calculate the total height of the subtitle
    //  const subtitleHeight = 1 * fontSize * lineSpacing + 80;
    //  logger.info(subtitleHeight);


      // Create the move effect string
      const moveEffect = ''//`{\\move(0,0,0,0)}`;
      const titlecolor = themecolourdecoder(`${current_theme.Offline.offlinetitlecolour}`);
  // const titlecolor = themecolourdecoder('FFBF00');
      const descriptioncolor = themecolourdecoder(`${current_theme.Offline.offlinetextcolour}`);
      const offlinebackgroundcolour = themecolourdecoder(`${current_theme.Offline.offlinebackgroundcolour}`);
      logger.info(titlecolor)
      logger.info(descriptioncolor)

      const newsFeed = `{\\r}{\\b1}{\\c&H${titlecolor}&}This Channel is Currently offline\n\n{\\r}{\\b0}{\\c&H${descriptioncolor}&}Next showing at: ${nextShowStartTime}\n\nStarting With: ${nextShowName}`;
      const lines = newsFeed.replace(/\n/g, '\\N');
  //    let lines = newsFeed;
      logger.info(lines)

      // Combine the move effect with the subtitle text
      const subtitle = `${moveEffect}${lines}`;

      const resolution = `${config_current.videoresolution}`

      const [width, height] = resolution.split('x');

      const centering = `${height}/2`;

      let assText = `[Script Info]
      Title: Scrolling Text Example
      ScriptType: v4.00+
      WrapStyle: 0
      PlayResX: ${width}
      PlayResY: ${height}

      [V4+ Styles]
      Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
      Style: Default, Arial, 32, &H00000000, &H00000000, &H00000000, &H00000000, 0, 0, 0, 0, 100, 100, 0, 0, 0, 0, 0, 5, 30, 30, 50, 0

        [Events]
        Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
        Dialogue: 0, 0:00:${startTime.toString().padStart(2, '0')}.00, 0:00:${endTime.toString().padStart(2, '0')}.00, Default, ScrollText, 0, 0, ${centering}, ,${subtitle}`;
logger.info(assText)
      fs.writeFileSync(`${CHANNEL_OFFLINEDIR}/${eachxmltvfile}.ass`, assText);


if (config_current.hwaccel !== "") {
  const hwaccell = ` -hwaccel ${config_current.hwaccel}`;
  console.log(hwaccell); // Use the constant as needed
} else {
  console.log("The input string is empty.");
}
if (config_current.hwaccel == "") {
  hwaccel = ` `;
  console.log('no hwaccel'); // Use the constant as needed
} else {
  hwaccel = ` -hwaccel ${config_current.hwaccel} `;
  console.log(hwaccel);
}

if (config_current.hwaccel_device == "") {
  hwacceldevice = ``;
  console.log('no hwacceldevice'); // Use the constant as needed
} else {
  hwacceldevice = `-hwaccel_device ${config_current.hwaccel_device} `;
  console.log(hwacceldevice);
}
      const command = `${config_current.customffmpeg || FFMPEGCOMMAND}${hwaccel}${hwacceldevice}-f lavfi -i color=${offlinebackgroundcolour}:${config_current.videoresolution} -stream_loop -1 -i "${audioFile}" -shortest -vf "ass=${CHANNEL_OFFLINEDIR}/${eachxmltvfile}.ass" -c:v ${config_current.ffmpegencoder} -c:a copy -t 5 ${config_current.output}/${eachxmltvfile}.mp4`;

      logger.info(command);
      logger.ffmpeg(`command is ${command}`);

      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Error: ${error.message}`);
          logger.error('If this symptom persists please check your ffmpeg version is at least 6.0 and has libass compiled in');
          return;
        }
        if (stderr) {
          logger.ffmpeg(`stderr: ${stderr}`);
          return;
        }
      });

      });
    } catch (error) {
      logger.error('Error reading XML file:', error);
    }
  };

  const runnersT = async () => {
    let fileList = await listFilesInDir(CHANNEL_OFFLINEDIR);

    logger.info(fileList);

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  async function processFiles() {
    for (const file of fileList) {
      if (path.extname(file) === '.xml') {
        logger.info(file);
        const filename = `${file}`;
        logger.info(filename)
        const filePath = filename.replace(/\.xml$/, "").replace("workdir\/Channel\-offline\/", "");

        logger.info(`file path is ${filePath}`);
        await startTimefind(filePath);

        // Introduce a delay of 1 second before processing the next file
        await delay(5000);
      }
    }
  }

  // Call the function to start processing the files
  processFiles();
    logger.success('complete generation of channel-offline filler');
  };

  try {
    const downloadedData = await downloadXmltv(`${config_current.ersatztv}/iptv/xmltv.xml`);
    // Handle the downloaded data
    logger.success('XMLTV downloaded successfully:', downloadedData);
  } catch (error) {
    // Handle the connection error
    logger.error('Error downloading or processing XMLTV:', error);
    // Stop further execution by throwing the error
    return
  }
  await splitXMLTVByChannel();
  await runnersT();
  isFunctionRunning = false;
};

module.exports = {
  CHANNEL_OFFLINE
};
