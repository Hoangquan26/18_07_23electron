const {ipcRenderer, contextBridge} = require('electron')

contextBridge.exposeInMainWorld('fileActions', {
    insertAccount: (type) => ipcRenderer.invoke('file:insertAccount', type),
    replyInsertAccount: (callback) => ipcRenderer.on('file:replyInsertAccount', callback)
})

contextBridge.exposeInMainWorld('seleniumActions', {
    /*
    data: [{
        newPassword: string,
        username: string,
        password: string
    }],
    options: {
        changePassword: bool,
        totalThread: number,
    }
    */
    startAction: (data = [], options= {}) => ipcRenderer.invoke('selenium:startAction', data, options),
    replyAccountData: (callback) => ipcRenderer.on('selenium:replyAccountData', callback)
})

contextBridge.exposeInMainWorld('cmdActions', {
    shutdownChrome : (data) => ipcRenderer.invoke('cmd:shutdownChrome', data)
})

contextBridge.exposeInMainWorld('appActions', {
    openAdvancedSetting: () => ipcRenderer.invoke('app:openAdvancedSetting')
})