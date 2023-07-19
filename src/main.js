//import lib
const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { Worker, workerData } = require('node:worker_threads')
//import define lib

const SeleniumAction = require('./controller/controller.selenium')
const { rejects } = require('assert')
//create Browser
let SELENIUM_QUEUE = 0
let SELENIUM_ARRAY = []


const seleniumPromiseContructor = (account) => {
    // const AccountMoney = await SeleniumAction.checkViaSo({username, password});
    return new Promise((resolve, reject) => {        
        const worker = new Worker('./src/worker/worker.check_via_so.js', {
            workerData: account
        })
        worker.on('message', data => {
            resolve(data)
        })
        worker.on('error', (err) => {
            reject(err)
        })
    })
    // resolve(AccountMoney)
}

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
    }, path = 'https://viaso1.com/', total_thread = 4) => {
        data?.forEach(async(account) => {
            SELENIUM_ARRAY.push((account))
            // if(SELENIUM_QUEUE < total_thread) {
            //     SELENIUM_QUEUE++
            //     console.log(await SeleniumAction.checkViaSo(account))
            //     SELENIUM_QUEUE--
            // }
            // else {

            // }
        })
        while(SELENIUM_ARRAY.length > 0) {
            if(SELENIUM_QUEUE < total_thread ){
                SELENIUM_QUEUE++
                const account = SELENIUM_ARRAY.shift()
                SeleniumAction.checkViaSo(account, event.sender)
                .then((data) => {
                    console.log(data)
                    SELENIUM_QUEUE--
                })
                // SELENIUM_QUEUE++
                // seleniumPromiseContructor(SELENIUM_ARRAY.shift())
                // const data = await seleniumPromiseContructor(SELENIUM_ARRAY.shift())
                // SELENIUM_QUEUE--
            }
        }
        console.log(SELENIUM_ARRAY)
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