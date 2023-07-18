//import lib
const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
//import define lib

const SeleniumAction = require('./controller/controller.selenium')
//create Browser
const createBrowserWindow = () => {

    //handle function
    const handleInsertAccount = async (event) => {
        const {canceled, filePaths} = await dialog.showOpenDialog()
        if(!canceled){
            const filePath = filePaths[0].toString()
            try {
                const data = fs.readFileSync(filePath, 'utf-8')
                console.log('ok')
                event.sender.send('file:replyInsertAccount', {
                    status: 200,
                    res: data
                })
            }
            catch (err){
                console.log(err)
                event.sender.send('file:replyInsertAccount', {
                    status: 500,
                    res: err
                })
            }
        }
    }

    const handleSeleniumStartAction = async(event, data, options={
        changePassword: null,
        totalThread: 1,
    }) => {
        data?.forEach(account => {
            const {username, password, changepass, newpass, proxy} = account
            SeleniumAction.checkAccount({username, password});
        })
    }
    

    const win = new BrowserWindow({
        height: 600,
        width: 1200,
        webPreferences: {
            preload: path.join(__dirname, './preload/preload.index.js')
        }
    })
    win.loadFile('src/index.html')

    //ipcMain handle
    ipcMain.handle('file:insertAccount', handleInsertAccount)
    ipcMain.handle('selenium:startAction', handleSeleniumStartAction)
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