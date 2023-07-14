const fs = require("fs")
const logger = require("../utils/logger.utils");
const moment = require('moment-timezone');
const { retrieveCurrentConfiguration } = require("../modules/config-loader.module");
const { downloadImage } = require("../utils/downloadimage.utils");
const { doesFileExist, loadFileContentsIntoMemory } = require("../utils/file.utils");
const { THEMES_FOLDER } = require("../constants/path.constants");
const { createDirectoryIfNotExists } = require("../utils/file.utils");


const settheme = async (theme) => {
  try {
    const fileData = await fs.readFileSync("config.json");
    const json = JSON.parse(fileData);
    json.theme = theme;
    await fs.writeFileSync("config.json", JSON.stringify(json, null, 2));
    logger.success(`Successfully updated theme to '${theme}' in config.json`);
  } catch (err) {
    logger.error(`Error updating theme to '${theme}' in config.json: ${err}`);
  }
}


const themecolourdecoder = (colour) => {

//  const colour = `${colourin}`;

  // Extracting individual color components
  const red = parseInt(colour.substring(0, 2), 16);
  const green = parseInt(colour.substring(2, 4), 16);
  const blue = parseInt(colour.substring(4, 6), 16);

  // Creating the RGB color code
  const themeColour = `${blue.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${red.toString(16).padStart(2, '0')}`;


  logger.info(themeColour);



     return themeColour
 }


 const retrieveCurrentTheme = async () => {
   const config_current = await retrieveCurrentConfiguration();
   const themeFileExists = await doesFileExist(`themes/system/${config_current.theme}.theme`);

   let usetheme = ''

   if (!themeFileExists) {
     logger.warn(`${config_current.theme}.json file is missing... Falling back to the SystemLight (Default) theme.`);
  return await themeDoesNotExist();
 } else {
     logger.info("Found the user selected theme file... loading...");
     return await retrieveTheme();
   }
 };

 const retrieveTheme = async () => {
   const config_current = await retrieveCurrentConfiguration();
   const data = await fs.readFileSync(`themes/system/${config_current.theme}.theme`);
   logger.info(JSON.parse(data))
    return JSON.parse(data)
 }

 const themeDoesNotExist = async () => {
   await createDirectoryIfNotExists('themes');
   await createDirectoryIfNotExists('themes/system')
   try {
     await downloadImage('https://raw.githubusercontent.com/liam8888999/ErsatzTV-Filler-Themes/main/SystemLight-Theme/SystemLight.theme', 'themes/system/SystemLight.theme');
   } catch (error) {
     logger.error(`Error downloading image: ${error.message}`);
   }
  await settheme('SystemLight');
    return await retrieveTheme();
 };

module.exports = {
    settheme,
    themecolourdecoder,
    retrieveCurrentTheme
}
