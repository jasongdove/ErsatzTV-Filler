const fs = require('fs');
const path = require('path');
const { WORKDIR, THEMES_FOLDER, AUDIOFALLBACKINTERNAL, FFMPEGPATHINTERNAL, RESOURCESPATH, CONFIG_DIR } = require("../constants/path.constants");
const { createDirectoryIfNotExists } = require("../utils/file.utils");
const os = require('os');

// Replace these with the actual paths to the files you want to delete
const foldersToDelete = [
  `${WORKDIR}`,
  `${THEMES_FOLDER}`,
  `${RESOURCESPATH}`
];

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call for directories
        deleteFolderRecursive(curPath);
      } else {
        // Delete files
        fs.unlinkSync(curPath);
      }
    });
    // Delete the empty folder
    fs.rmdirSync(folderPath);
    console.log(`Deleted folder and its contents: ${folderPath}`);
  }
}

function deleteFoldersOnShutdown() {
  // Delete folders here
  foldersToDelete.forEach((folderPath) => {
    try {
      deleteFolderRecursive(folderPath);
    } catch (err) {
      console.error(`Error deleting folder ${folderPath}: ${err.message}`);
    }
  });
}

async function createrequiredstartupfolders() {
await createDirectoryIfNotExists(CONFIG_DIR);
await createDirectoryIfNotExists(WORKDIR);
await createDirectoryIfNotExists(THEMES_FOLDER);
await createDirectoryIfNotExists(`${THEMES_FOLDER}/system`);
await createDirectoryIfNotExists(`${THEMES_FOLDER}/user`);
await createDirectoryIfNotExists(`${RESOURCESPATH}`);
await createDirectoryIfNotExists(`${RESOURCESPATH}/ffmpeg`);
await createDirectoryIfNotExists(`${RESOURCESPATH}/audio-fallback`);
}

function copyResources() {

  function copyFileWithPermissions(sourceFile, destinationFile) {
    const sourceStream = fs.createReadStream(sourceFile);
    const destinationStream = fs.createWriteStream(destinationFile);

    sourceStream.pipe(destinationStream);

    sourceStream.on('end', () => {
      // Get the source file permissions
      const sourceStats = fs.statSync(sourceFile);

      // Set the same permissions on the destination file
      fs.chmodSync(destinationFile, sourceStats.mode);

      console.log(`Copied file: ${sourceFile} -> ${destinationFile}`);
    });

    sourceStream.on('error', (error) => {
      console.error(`Error copying file: ${sourceFile} -> ${destinationFile}`);
      console.error(error);
    });
  }

function copyFolderRecursive(source, destination) {
  // Check if the source folder exists
  if (!fs.existsSync(source)) {
    console.error(`Source folder "${source}" does not exist.`);
    return;
  }

  // Create the destination folder if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  // Read the contents of the source folder
  const files = fs.readdirSync(source);

  // Loop through each item in the source folder
  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const destinationPath = path.join(destination, file);

    // Check if the item is a directory
    if (fs.lstatSync(sourcePath).isDirectory()) {
      // Recursively copy subfolders
      copyFolderRecursive(sourcePath, destinationPath);
    } else {
      // Copy files with permissions
      copyFileWithPermissions(sourcePath, destinationPath);
      console.log(`Copied file: ${sourcePath} -> ${destinationPath}`);
    }
  });
}
copyFolderRecursive(AUDIOFALLBACKINTERNAL, `${RESOURCESPATH}/audio-fallback`);


let ffmpegResourcesPath;
let FFMPEGINTERALPATH;
if (os.platform() === 'win32') {
  FFMPEGINTERNALPATH = path.join(FFMPEGPATHINTERNAL, 'ffmpeg-windows.exe');
  ffmpegResourcesPath = path.join(RESOURCESPATH, 'ffmpeg', 'ffmpeg-windows.exe');
console.log("windows")
} else if (os.platform() === 'linux') {
  FFMPEGINTERNALPATH = path.join(FFMPEGPATHINTERNAL, 'ffmpeg-linux');
  ffmpegResourcesPath = path.join(RESOURCESPATH, 'ffmpeg', 'ffmpeg-linux');
  console.log("linux")
} else if (os.platform() === 'darwin') {
  console.log("darwin")
  FFMPEGINTERNALPATH = path.join(FFMPEGPATHINTERNAL, 'ffmpeg-darwin');
  ffmpegResourcesPath = path.join(RESOURCESPATH, 'ffmpeg', 'ffmpeg-darwin');
} else {
  // Handle other platforms or provide a default value
  console.log("operating system unknown, not copying ffmpeg to resources folder, will test if ffmpeg is installed on the system and try to use that")
}
copyFileWithPermissions(FFMPEGINTERNALPATH, ffmpegResourcesPath);
//copyFolderRecursive(FFMPEGPATHINTERNAL, `${RESOURCESPATH}/ffmpeg`);
}






module.exports = {
    deleteFoldersOnShutdown,
    createrequiredstartupfolders,
    copyResources
};
