const { app, BrowserWindow, globalShortcut } = require('electron')

const createBrowserWindow = () => {
    const win = new BrowserWindow({
        height: 600,
        width: 900
    })
    win.loadFile('src/index.html')
}

app.on("ready", () => {

    const openDevTool = globalShortcut.register("F12", () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if(focusedWindow) {
            focusedWindow.webContents.openDevTools()
        }
    })
    createBrowserWindow()


    app.on("activate", () => {
        if(BrowserWindow.getAllWindows().length === 0) createBrowserWindow()
    })
})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') app.quit()
    globalShortcut.unregisterAll()  
})