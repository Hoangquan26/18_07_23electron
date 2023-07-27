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
    startAction: (data = [], options= {}, mainOptions) => ipcRenderer.invoke('selenium:startAction', data, options, mainOptions),
    replyAccountData: (callback) => ipcRenderer.on('selenium:replyAccountData', callback),
    onReplyFacebookAccountData : (callback) => ipcRenderer.on('selenium:replyFacebookAccountData', callback),
    offReplyFacebookAccountData : () => ipcRenderer.off('selenium:offReplyFacebookAccountData'),
})

contextBridge.exposeInMainWorld('cmdActions', {
    shutdownChrome : (data) => ipcRenderer.invoke('cmd:shutdownChrome', data)
})

contextBridge.exposeInMainWorld('appActions', {
    openAdvancedSetting: () => ipcRenderer.invoke('app:openAdvancedSetting'),
    openOrderHistory: (username, fileName) => ipcRenderer.invoke('app:openOrderHistory', username, fileName)
})

contextBridge.exposeInMainWorld('settingAction', {
    changeSelectedSetting : (data) => ipcRenderer.invoke('setting:changeSelectedSetting', data),
})