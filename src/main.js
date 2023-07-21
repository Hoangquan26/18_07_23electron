//import lib
const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { Worker, workerData } = require('node:worker_threads')
const child_process = require('child_process')
//import define lib
const ProxyController = require('./controller/controller.proxy')
const SeleniumAction = require('./controller/controller.selenium')
const { rejects } = require('assert')
const { resolve } = require('path')
const ResponseController = require('./controller/controller.response')
//create Browser
let SELENIUM_QUEUE = 0
let SELENIUM_ARRAY = []
let complete = 0

// const seleniumPromiseContructor = (account) => {
//     // const AccountMoney = await SeleniumAction.checkViaSo({username, password});
//     return new Promise((resolve, reject) => {        
//         const worker = new Worker('./src/worker/worker.check_via_so.js', {
//             workerData: account
//         })
//         worker.on('message', data => {
//             resolve(data)
//         })
//         worker.on('error', (err) => {
//             reject(err)
//         })
//     })
//     // resolve(AccountMoney)
// }

const workerPromise = (array, event, options, position) => {
    return new Promise((resolve, reject) => {
        const params = {account: array.shift(), sender: event.sender, options, position}
        const res = SeleniumAction.checkViaSo(params)
        resolve(res)
    })
}

const refreshAutoProxy = (proxies) => proxies[Math.floor(Math.random() * proxies.length)]

const backtrackWorking = ({total_thread, event, options}) => {
    if(SELENIUM_ARRAY.length == 0 || complete)
        return
    if(SELENIUM_QUEUE > total_thread)
        return
    if(SELENIUM_QUEUE < total_thread) {
        SELENIUM_QUEUE++
        options.normalProxy = options.autoProxy ? refreshAutoProxy(options.autoProxy) : options.normalProxy 
        // if(options.autoProxy){
        //     options.normalProxy = refreshAutoProxy(options.autoProxy)
        // }
        // else {

        // }
        workerPromise(SELENIUM_ARRAY, event, options, SELENIUM_QUEUE)
        .then(data => {
            SELENIUM_QUEUE--
            return backtrackWorking({total_thread, event, options})
        })
        if(SELENIUM_QUEUE < total_thread)
            return backtrackWorking({total_thread, event, options})
        else 
            return
    }
}


const createBrowserWindow = () => {

    //handle function
    const handleInsertAccount = async (event, type) => {
        const {canceled, filePaths} = await dialog.showOpenDialog()
        if(!canceled){
            const filePath = filePaths[0].toString()
                try {
                    const data = fs.readFileSync(filePath, 'utf-8')
                    console.log('ok')
                    event.sender.send('file:replyInsertAccount', {
                        status: 200,
                        res: data,
                        type
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
        newPass: null,        
        changePassword: false,
        totalThread: 1,
        path: 'https://viaso1.com/',
        autoProxy: null,
        normalProxy: null,
        startDelay: 1,
        endDelay: 3,
        headless: false,
        userAgent: ''
    }) => {
        complete = 0
        data?.forEach(async(account) => {
            SELENIUM_ARRAY.push((account))
            ResponseController.replyAccountData({id: account.id, status: 'Trong hàng chờ'}, event.sender)
        })
        switch(options.path) {
            case 'https://viaso1.com/':
                if(options.autoProxy?.length > 0) {
                    new Promise((resolve, rejects) => {
                        const worker =  new Worker('./src/worker/worker.proxy.js', {
                            workerData: options.autoProxy
                        })
                        worker.on('message', (value) => {
                            const proxies = value
                                // while(SELENIUM_ARRAY.length > 0) {
                                //     if(SELENIUM_QUEUE < options.totalThread){
                                //         const proxy = refreshAutoProxy(proxies)
                                //         options['normalProxy'] = proxy
                                //         SELENIUM_QUEUE++
                                //         workerPromise(SELENIUM_ARRAY, event, options)
                                //         .then((data) => {
                                //             console.log(data)
                                //             SELENIUM_QUEUE--
                                //             const proxy = refreshAutoProxy(proxies)
                                //             options['normalProxy'] = proxy
                                //             if(DOLATER_QUEUE.length){
                                //                 workerPromise(DOLATER_QUEUE, event, options)
                                //             }
                                //         })
                                //     }
                                //     else {
                                //         DOLATER_QUEUE.push(SELENIUM_ARRAY.shift())
                                //     }
                                // }
                                options.autoProxy = proxies
                                backtrackWorking({total_thread: options.totalThread, event, options})
                                worker.terminate()
                        })
                    })
                }
                else {
                    // while(SELENIUM_ARRAY.length > 0) {
                    //     if(SELENIUM_QUEUE < options.totalThread){
                    //         const proxy = options.normalProxy
                    //         options['normalProxy'] = proxy
                    //         SELENIUM_QUEUE++
                    //         workerPromise(SELENIUM_ARRAY, event, options)
                    //         .then((data) => {
                    //             SELENIUM_QUEUE--
                    //             const proxy = options.normalProxy
                    //             options['normalProxy'] = proxy
                    //             workerPromise(DOLATER_QUEUE, event, options)
                    //         })
                    //     }
                    //     else {
                    //         DOLATER_QUEUE.push(SELENIUM_ARRAY.shift())
                    //     }
                    // }
                    backtrackWorking({total_thread: options.totalThread, event, options})
                }
                break;
            case 'https://facebook.com' :
                break;
            default:
                break;
        }
    }

    //define Window
    const win = new BrowserWindow({
        height: 600,
        width: 1200,
        webPreferences: {
            preload: path.join(__dirname, './preload/preload.index.js')
        },
        icon: path.join(__dirname, './assets/images/app_icon.png')
    })
    const advancedSettingWin = new BrowserWindow({
        height:500,
        width:800,
        parent: win,
        title: "Cài đặt nâng cao",
        show: false,
        icon: path.join(__dirname, './assets/images/app_icon.png')
    })
    advancedSettingWin.loadFile('src/childWindow/advancedSetting')
    win.loadFile('src/index.html')

    //ipcMain handle
    ipcMain.handle('file:insertAccount', handleInsertAccount)
    ipcMain.handle('selenium:startAction', handleSeleniumStartAction)
}

app.on("ready", () => {
    ipcMain.handle('cmd:shutdownChrome', (event, data) => {
        child_process.exec('Taskkill /F /IM Chrome.exe')
        complete = 1
        SELENIUM_ARRAY = []
        data.forEach(item => {
            ResponseController.replyAccountData({id: item.id, status: 'Không hoạt động'}, event.sender)
        })
    })
    //define shortcut
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