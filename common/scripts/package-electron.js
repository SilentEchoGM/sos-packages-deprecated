const { join } = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const runCmd = promisify(exec);

const regex = new RegExp(
  /^.{2}([0-9]{2})-([0-9]{2})-([0-9]{2})(T)([0-9]{2}):([0-9]{2}):([0-9]{2}).+$/
);

const sanitizeDateForFilename = (date = new Date()) =>
  date.toISOString().match(regex).slice(1).join("");

const PATH_ROOT = join(__dirname, "..", "..");

console.log(PATH_ROOT);

const PATH_TO_PREDIST = join(PATH_ROOT, "common", "predist");
const PATH_TO_PREDIST_ARCHIVE = join(PATH_ROOT, "common", "predist-archive");

const PATH_TO_NEW_ARCHIVE = join(
  PATH_TO_PREDIST_ARCHIVE,
  sanitizeDateForFilename(new Date())
);

const PATH_TO_ELECTRON_BUILD = join(PATH_ROOT, "emulator-electron", "build");
const PATH_TO_SVELTE_BUILD = join(PATH_ROOT, "emulator-svelte", "public");

const fs = require(join(
  PATH_TO_ELECTRON_BUILD,
  "..",
  "node_modules",
  "fs-extra"
));

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

const archivePredist = () => fs.move(PATH_TO_PREDIST, PATH_TO_NEW_ARCHIVE);

const createPredistFolder = () => fs.ensureDir(PATH_TO_PREDIST);

const copyElectron = async () => {
  await fs.copy(
    PATH_TO_ELECTRON_BUILD,
    join(PATH_TO_PREDIST, "electron", "build")
  );
  await fs.copy(
    join(PATH_TO_ELECTRON_BUILD, "..", "package.json"),
    join(PATH_TO_PREDIST, "electron", "package.json")
  );
  await fs.copy(
    join(PATH_TO_ELECTRON_BUILD, "..", "node_modules"),
    join(PATH_TO_PREDIST, "electron", "node_modules")
  );
};

const copySvelte = () =>
  fs.copy(PATH_TO_SVELTE_BUILD, join(PATH_TO_PREDIST, "svelte"));

const cmdElectron = `cd ${join(PATH_TO_PREDIST, "electron")} && npm run dist`;

const execCommand = async (
  command = 'echo "No command given to execCommand"'
) => {
  try {
    const { stdout, stderr } = await runCmd(command);
    console.log("\n\nOut:\n\t", stdout);
    if (stderr) console.log("\n\nErr:\n\t", stderr);
  } catch (err) {
    console.error(err);
  }
};

let i = 0;
const runBuild = async () => {
  console.log(`\n${++i}: Archiving Predist Folder\n`);
  await archivePredist();
  console.log(`\n${++i}: Creating Predist Folder\n`);
  await createPredistFolder();
  console.log(`\n${++i}: Copying Electron\n`);
  await copyElectron();
  console.log(`\n${++i}: Copying Svelte\n`);
  await copySvelte();
  console.log(`\n${++i}: Packaging Emulator build\n`);
  await execCommand(cmdElectron);
};

runBuild();
