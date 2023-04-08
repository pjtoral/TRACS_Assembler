const { ipcRenderer} = require("electron");
const path = require("path");

window.addEventListener("DOMContentLoaded", () => {

    const el = {
        compile: document.getElementById("compile"),
        documentName: document.getElementById("documentName"),
        fopen: document.getElementById("fopen"),
        fcreate: document.getElementById("fcreate"),
        export: document.getElementById("export"),
        fsave: document.getElementById("fsave"),
        inputArea: document.getElementById("inputArea"),
        outputArea: document.getElementById("outputArea"),
        exitBtn: document.getElementById("exitBtn"),
        minimize: document.getElementById("minimize"),
    };

    //exit
    el.exitBtn.addEventListener("click", () => {
        ipcRenderer.send("close-app");
    });

    //minimize
    el.minimize.addEventListener("click", () => {
        ipcRenderer.send("minimize");
    });



    const handleDocumentChange = (filePath, content = "") => {
        el.documentName.innerHTML = path.parse(filePath).base;
        el.inputArea.removeAttribute("disabled"),
        el.inputArea.value= content;
        el.inputArea.focus();

    }

    const handleOutput= (content) => {
        el.outputArea.removeAttribute("disabled"),
        el.outputArea.setAttribute("readonly", true),
        el.outputArea.value= content.toString();
        el.outputArea.focus();

    }

    // For Compiling
    el.compile.addEventListener("click", () => {
        ipcRenderer.send("file-content-updated", inputArea.value);
        ipcRenderer.send("compile-clicked");
    });
    ipcRenderer.on('compiled',(_,content) => {
        handleOutput(content);
    });
 
    // For Exporting
    el.export.addEventListener("click", () => {
        ipcRenderer.send("export-clicked", outputArea.value);
    });
    ipcRenderer.on('exported',(_,content) => {
        
    });

    // For opening document
    el.fopen.addEventListener("click", () => {
        ipcRenderer.send("open-document-triggered");
    });
    ipcRenderer.on('document-opened', (_, {filePath,content}) => {
        handleDocumentChange(filePath, content);
    });


    // For creating document
    el.fcreate.addEventListener("click", ()=>{
        ipcRenderer.send("create-document-triggered");
     });

    ipcRenderer.on('document-created', (_,filePath) => {
        handleDocumentChange(filePath);
    });


    // For saving input in Text area
    el.fsave.addEventListener("click" , () => {
       if(inputArea.value != null)
       {
        ipcRenderer.send("file-content-updated", inputArea.value);
       }
       
    });

});



