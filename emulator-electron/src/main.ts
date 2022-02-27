import { app, BrowserWindow } from "electron";
import { getLogger } from "./lib/logger";
import { join } from "path";
import { fork } from "child_process";
import { startSOSEmulator } from "./lib/socket";
import { URL } from "url";
const log = getLogger({ filepath: "electron/main.ts" });

const dev = process.env.NODE_ENV === "development";
const iconPath = join(__dirname, "graphics", "logo.png");

log.info(`Icon: ${iconPath}`);

if (!dev) {
  const kit = fork(join(__dirname, "..", "svelte"));

  kit.on("error", (err) => {
    log.error("SvelteKit error", err);
  });

  process.on("beforeExit", () => {
    kit.kill();
  });
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 455,
    height: 820,
    webPreferences: {
      devTools: dev,
      contextIsolation: false,
      nodeIntegration: true,
    },
    backgroundColor: "#322214",
    icon: iconPath,
    autoHideMenuBar: true,
    roundedCorners: true,
    title: "SOS Emulator",
  });

  const url = new URL(
    dev
      ? "http://localhost:34952"
      : `file:///${__dirname}/../svelte/public/index.html`
  ).toString();

  win.loadURL(url).catch((err) => {
    if (err) {
      setTimeout(() => {
        win.loadURL(url).catch((err) => {
          log.error(
            "Retried once, looks like the port is blocked or the SvelteKit server is having an issue.",
            {
              err,
            }
          );
        });
      }, 3000);
    }
  });
};

app.whenReady().then(createWindow);

startSOSEmulator();
