// electron/preload.cjs
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
    hello: () => "hello from preload",
});
