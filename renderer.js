const { ipcRenderer} = require("electron");
const path = require("path");

window.addEventListener("DOMContentLoaded", () => {
    const el = {
        exitPane: document.getElementById("exitPane"),
        compile: document.getElementById("compile"),
        documentName: document.getElementById("documentName"),
        fopen: document.getElementById("fopen"),
        fcreate: document.getElementById("fcreate"),
        export: document.getElementById("export"),
        fsave: document.getElementById("fsave"),
        inputArea: document.getElementById("inputArea"),
        outputArea: document.getElementById("outputArea"),
    };

    /*buggy only works when header is shown*/
    el.exitPane.addEventListener("click", () => {
        ipcRenderer.send("close-app");
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
        ipcRenderer.send("file-content-updated", inputArea.value);
    });

});



