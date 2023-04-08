const assembler = require("./assembler");
const {ipcMain, dialog, Notification, Menu, screen, remote} = require("electron");
const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");
const fs = require("fs");

const isDevEnv = process.env.NODE_ENV === "development";

if(isDevEnv)
{
    try{
        require("electron-reloader")(module);
    }catch{}
}


let win;
let openedFilePath;

/*get back to this*/
ipcMain.on("close-app", () => {
   win.close();
    BrowserWindow.getFocusedWindow().minimize();
})

ipcMain.on("minimize", () => {
    BrowserWindow.getFocusedWindow().minimize();
 })



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
    
    if(isDevEnv)
    {
        win.webContents.openDevTools();
    }
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


const handleError = () => {
    new Notification({
        title: "Error",
        body: "Sorry, something went wrong",
    }).show();
};

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
               handleError();
            }
            else
            {
                openedFilePath = filePath;
                win.webContents.send("document-opened", {filePath, content});
                new Notification({
                    title: "Opened",
                    body: "Document opened",
                }).show();
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
                handleError();
            }
            else
            {
                openedFilePath = filePath;
                win.webContents.send("document-created", filePath);
                new Notification({
                    title: "Created",
                    body: "Document created",
                }).show();
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
                handleError();
            }
            else
            {
                win.webContents.send("exported");
                new Notification({
                    title: "Exported",
                    body: "Text file created",
                }).show();
            }
        });
    })
});

ipcMain.on("file-content-updated", (_, textareaContent) => {
    fs.writeFile(openedFilePath, textareaContent, (error) => {
        if(error)
        {
            handleError();
        }
        new Notification({
            title: "Saved",
            body: "Document Saved",
        }).show();
    });
})



ipcMain.on("compile-clicked", async () => {
    let str = await assembler(openedFilePath);
    console.log(str);
    win.webContents.send("compiled", str);
});




