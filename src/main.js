//import lib
const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { Worker, workerData } = require('node:worker_threads')
//import define lib
const ProxyController = require('./controller/controller.proxy')
const SeleniumAction = require('./controller/controller.selenium')
const { rejects } = require('assert')
const { resolve } = require('path')
const ResponseController = require('./controller/controller.response')
//create Browser
let SELENIUM_QUEUE = 0
let SELENIUM_ARRAY = []

let DOLATER_QUEUE = []
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

const workerPromise = (array, event, options) => {
    return new Promise((resolve, reject) => {
        const res = SeleniumAction.checkViaSo(array.shift(), sender = event.sender, options)
        resolve(res)
    })
}

const refreshAutoProxy = (proxies) => proxies[Math.floor(Math.random() * proxies.length)]


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
        newPass: null,        
        changePassword: false,
        totalThread: 1,
        path: 'https://viaso1.com/',
        autoProxy: null,
        normalProxy: null,
        startDelay: 1,
        endDelay: 3 
    }) => {
        console.log(options)
        // switch(options.path) {
        //     case 'https://viaso1.com/' :
        //         break;
        //     default:
        //         break;
        // }
        data?.forEach(async(account) => {
            SELENIUM_ARRAY.push((account))
            ResponseController.replyAccountData({id: account.id, status: 'Trong hàng chờ'}, event.sender)
        })

        if(options.autoProxy) {
            new Promise((resolve, rejects) => {
                const worker =  new Worker('./src/worker/worker.proxy.js', {
                    workerData: options.autoProxy
                })
                worker.on('message', (value) => {
                    const proxies = value
                    // startWorking({options, account : data, event, proxies})
                    // while(SELENIUM_ARRAY.length > 0) {
                        // if(SELENIUM_QUEUE < options.totalThread){
                        //     SELENIUM_QUEUE++
                        //     const seleworker =  new Worker('./src/worker/worker.check_via_so.js', {
                        //         workerData :{
                        //             account: SELENIUM_ARRAY.shift(),
                        //             proxies,
                        //             event: JSON.stringify(event.sender), 
                        //             options
                        //         }
                        //     })
                        //     seleworker.on('message', (value) => {
                        //         console.log(value)
                        //         SELENIUM_QUEUE--
                        //     })
                        // }
                        while(SELENIUM_ARRAY.length > 0) {
                            if(SELENIUM_QUEUE < options.totalThread){
                                const proxy = refreshAutoProxy(proxies)
                                options['normalProxy'] = proxy
                                SELENIUM_QUEUE++
                                // new Promise((resolve, reject) => {
                                //     const res = SeleniumAction.checkViaSo(SELENIUM_ARRAY.shift(), sender = event.sender, options)
                                //     resolve(res)
                                // })
                                workerPromise(SELENIUM_ARRAY, event, options)
                                .then((data) => {
                                    console.log(data)
                                    SELENIUM_QUEUE--
                                    const proxy = refreshAutoProxy(proxies)
                                    options['normalProxy'] = proxy
                                    workerPromise(DOLATER_QUEUE, event, options)
                                })
                            }
                            else {
                                DOLATER_QUEUE.push(SELENIUM_ARRAY.shift())
                            }
                        }
                        worker.terminate()
                    // }
                })
            })
        }
        else {
            console.log('inhere')
            while(SELENIUM_ARRAY.length > 0) {
                if(SELENIUM_QUEUE < options.totalThread){
                    const proxy = options.normalProxy
                    options['normalProxy'] = proxy
                    SELENIUM_QUEUE++
                    // new Promise((resolve, reject) => {
                    //     const res = SeleniumAction.checkViaSo(SELENIUM_ARRAY.shift(), sender = event.sender, options)
                    //     resolve(res)
                    // })
                    workerPromise(SELENIUM_ARRAY, event, options)
                    .then((data) => {
                        console.log(data)
                        SELENIUM_QUEUE--
                        const proxy = options.normalProxy
                        options['normalProxy'] = proxy
                        workerPromise(DOLATER_QUEUE, event, options)
                    })
                }
                else {
                    DOLATER_QUEUE.push(SELENIUM_ARRAY.shift())
                }
            }
        }
    }

    //define Window
    const win = new BrowserWindow({
        height: 600,
        width: 1200,
        webPreferences: {
            preload: path.join(__dirname, './preload/preload.index.js')
        }
    })
    const advancedSettingWin = new BrowserWindow({
        height:500,
        width:800,
        parent: win,
        title: "Cài đặt nâng cao",
        show: false
    })
    advancedSettingWin.loadFile('src/childWindow/advancedSetting')
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