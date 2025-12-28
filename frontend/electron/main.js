import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath , pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 Resolve backend path correctly (dev vs prod)
const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, "backend", "server.js")
    : path.join(__dirname, "../../backend/server.js");

const backendUrl = pathToFileURL(backendPath).href;
// 🔥 Start backend dynamically
import(backendUrl).catch((err) => {
    console.error("Failed to start backend:", err);
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,

        // 🔥 Use absolute icon path (important)
        icon: path.join(__dirname, "assets", "icon.jpg"),

        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
        },
    });

    win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(createWindow);
