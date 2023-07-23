const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('windows', {
    setupData: (callback) => ipcRenderer.on('window:setupData', callback)
})
