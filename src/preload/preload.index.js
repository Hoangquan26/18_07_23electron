const {ipcRenderer, contextBridge} = require('electron')

contextBridge.exposeInMainWorld('fileActions', {
    insertAccount: () => ipcRenderer.invoke('file:insertAccount'),
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