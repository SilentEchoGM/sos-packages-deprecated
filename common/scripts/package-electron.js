const fs = require("fs/promises");
const { join } = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const runCmd = promisify(exec);

const regex = new RegExp(
  /^.{2}([0-9]{2})-([0-9]{2})-([0-9]{2})(T)([0-9]{2}):([0-9]{2}):([0-9]{2}).+$/
);

const sanitizeDateForFilename = (date = new Date()) =>
  date.toISOString().match(regex).slice(1).join("");

const PATH_TO_PREDIST = join(__dirname, "..", "..", "..", "archive", "predist");
const PATH_TO_PREDIST_ARCHIVE = join(PATH_TO_PREDIST, "..", "predist-archive");
const PATH_TO_NEW_ARCHIVE = join(
  PATH_TO_PREDIST_ARCHIVE,
  sanitizeDateForFilename(new Date())
);
const PATH_TO_ELECTRON = join(PATH_TO_PREDIST, "emulator-electron");

const handleRenameError = async (err) => {
  if (err.errno == -4075) {
    console.log(-4075, JSON.stringify(err), err);
    return;
  }
  if (err.errno == -4058) {
    console.log(-4058, JSON.stringify(err), err);
    try {
      await fs.mkdir(PATH_TO_PREDIST_ARCHIVE);
      console.log("Created a new predist archive folder");
    } catch (err) {
      console.error(err);
    } finally {
      try {
        await fs.rename(PATH_TO_PREDIST, PATH_TO_NEW_ARCHIVE);
        console.log("Archived the old predist folder");
      } catch (err) {
        console.log(
          "Probably no existing predist folder, no archiving necessary."
        );
        console.warn(err);
      }
    }
  } else {
    console.log(
      "Unhandled error moving the old predist folder",
      JSON.stringify(err)
    );
    throw err;
  }
};

const archivePredist = () =>
  fs.rename(PATH_TO_PREDIST, PATH_TO_NEW_ARCHIVE).catch(handleRenameError);

const createPredistFolder = () =>
  fs.mkdir(PATH_TO_PREDIST).catch((err) => {
    throw err;
  });

const cmdDeploy = `rush deploy -s electron -t "${PATH_TO_PREDIST}"`;
const cmdElectron = `cd ${PATH_TO_ELECTRON} && rushx dist`;

const execCommand = async (
  command = 'echo "No command given to execCommand"'
) => {
  try {
    const { stdout, stderr } = await runCmd(command);
    console.log("\n\nOut:\n\t", stdout);
    console.log("\n\nErr:\n\t", stderr);
  } catch (err) {
    console.error(err);
  }
};

const runBuild = async () => {
  console.log("\n1: Archiving Predist Folder\n");
  await archivePredist();
  console.log("\n2: Creating Predist Folder\n");
  await createPredistFolder();
  console.log("\n3: Deploying Emulator build\n");
  await execCommand(cmdDeploy);
  console.log("\n4: Packaging Emulator build\n");
  await execCommand(cmdElectron);
};

runBuild();
