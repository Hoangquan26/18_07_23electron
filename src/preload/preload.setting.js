const { ipcRenderer, contextBridge} = require('electron')

contextBridge.exposeInMainWorld('settingAction', {
    getSavePath: () => ipcRenderer.invoke('setting:getSavePath'),
    replySavePath: (callback) => ipcRenderer.on('setting:replySavePath', callback),
    saveSetting: (data) => ipcRenderer.invoke('setting:saveSetting', data),
    changeSelectedSetting : (data) => ipcRenderer.invoke('setting:changeSelectedSetting', data),
})