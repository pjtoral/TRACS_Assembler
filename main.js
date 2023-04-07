const assembler = require("./assembler");
const {ipcMain, dialog } = require("electron");
const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");
const fs = require("fs");

let win;
let openedFilePath;

function createWindow() {
    win = new BrowserWindow({
        width: 1720,
        height: 820,
        titleBarStyle: "hidden", 
        webPreferences:{
            preload: path.join(__dirname, 'renderer.js'),
            nodeIntegration: true
        }
    });
    
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes : true
    }));

    win.on('closed', () =>{
        win = null;
    })
 
}

app.on('ready', createWindow);

app.on('window-all-closed', () =>{
    if(process.platform !== 'darwin'){
        app.quit();
    }
});

app.on('activate', () =>{
    if(win === null){
        createWindow();
    }
});

ipcMain.on("open-document-triggered", () => {
    dialog
    .showOpenDialog({
        properties: ["openFile"],
        filters: [{name: "asm files", extensions: ["asm"] }],
    })
    .then(({ filePaths}) => {
        const filePath = filePaths[0];
        fs.readFile(filePath, 'utf-8', (error,content) => {
            if(error)
            {
                console.log('error');
            }
            else
            {
                openedFilePath = filePath;
                win.webContents.send("document-opened", {filePath, content});
            }
        });
    });
});

ipcMain.on("create-document-triggered", () => {
    dialog
    .showSaveDialog(win,{
        filters: [{name: "asm files", extensions: ["asm"]}]
    })
    .then(({filePath}) => {
        fs.writeFile(filePath, "", (error) => {
            if(error)
            {
                console.log('error');
            }
            else
            {
                openedFilePath = filePath;
                win.webContents.send("document-created", filePath);
            }
        });
    })
})

ipcMain.on("export-clicked", (_, outputAreaContent) => {
    dialog
    .showSaveDialog(win,{
        filters: [{name: "text files", extensions: ["txt"]}]
    })
    .then(({filePath}) => {
        fs.writeFile(filePath, outputAreaContent, (error) => {
            if(error)
            {
                console.log('error');
            }
            else
            {
                win.webContents.send("exported");
            }
        });
    })
});

ipcMain.on("file-content-updated", (_, textareaContent) => {
    fs.writeFile(openedFilePath, textareaContent, (error) => {
        if(error)
        {
            console.log('error');
        }
        
    });
})

/*get back to this*/
ipcMain.on("close-app", () => {
    win.close();
})

ipcMain.on("compile-clicked", async () => {
    let str = await assembler(openedFilePath);
    console.log(str);
    win.webContents.send("compiled", str);
});




