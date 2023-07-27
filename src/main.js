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
const { resolve, extname } = require('path')
const ResponseController = require('./controller/controller.response')
const { getSavePath, saveConfig, changeSelectedSetting} = require('./controller/controller.setting')
//create Browser
let SELENIUM_QUEUE = 0
let SELENIUM_ARRAY = []
let complete = 0
const usedProxies = []
let runTime = 0;
let savedProxy = null

const workerPromiseShopVia = (array, event, options, position, shopViaOptions) => {
    runTime++
    return new Promise((resolve, reject) => {
        const params = {account: array.shift(), sender: event.sender, options, position, shopViaOptions}
        const res = SeleniumAction.checkViaSo(params)
        resolve(res)
    })
}

const workerPromiseFacebook = (array, event, options, position, facebookOptions) => {
    runTime++
    return new Promise((resolve, reject) => {
        const params = {account: array.shift(), sender: event.sender, options, position, facebookOptions}
        const res = SeleniumAction.workingWithFacebook(params)
        resolve(res)
    })
}

const refreshAutoProxy = (proxies) => proxies[Math.floor(Math.random() * proxies.length)]

const backtrackWorking = ({total_thread, event, options, mainOptions, callback}) => {
    if(SELENIUM_ARRAY.length == 0 || complete)
        return
    if(SELENIUM_QUEUE > total_thread)
        return
    if(SELENIUM_QUEUE < total_thread) {
        SELENIUM_QUEUE++
        if(runTime % options.accountsPerProxy == 0 && options.autoProxy) { 
            if(savedProxy)
            {
                usedProxies.push(savedProxy)
            }
            // console.log(usedProxies.includes(savedProxy))
            if(runTime == 0)
                savedProxy = refreshAutoProxy(options.autoProxy)
            else {                
                while(usedProxies.includes(savedProxy)) {
                    savedProxy = refreshAutoProxy(options.autoProxy)
                }
            } 
        }
        options.normalProxy = options.autoProxy ? savedProxy : options.normalProxy 
        callback(SELENIUM_ARRAY, event, options, SELENIUM_QUEUE, mainOptions)
        .then(data => {
            SELENIUM_QUEUE--
            return backtrackWorking({total_thread, event, options, mainOptions, callback})
        })
        if(SELENIUM_QUEUE < total_thread)
            return backtrackWorking({total_thread, event, options, mainOptions, callback})
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
            const fileName = path.basename(filePath, path.extname(filePath)).split('.')[1]
                try {
                    const data = fs.readFileSync(filePath, 'utf-8')
                    event.sender.send('file:replyInsertAccount', {
                        status: 200,
                        res: data,
                        type,
                        fileName
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
    },
    mainOptions
    ) => {
        complete = 0
        switch(options.path) {
            case 'ShopVia':
                data?.forEach(async(account) => {
                    SELENIUM_ARRAY.push((account))
                    ResponseController.replyAccountData({id: account.id, status: 'Trong hàng chờ'}, event.sender)
                })
                if(options.autoProxy?.length > 0) {
                    new Promise((resolve, rejects) => {
                        const worker =  new Worker('./src/worker/worker.proxy.js', {
                            workerData: options.autoProxy
                        })
                        worker.on('message', (value) => {
                            const proxies = value
                                options.autoProxy = proxies
                                backtrackWorking({total_thread: options.totalThread, event, options,mainOptions, callback: workerPromiseShopVia})
                                worker.terminate()
                        })
                    })
                }
                else {
                    backtrackWorking({total_thread: options.totalThread, event, options,mainOptions, callback: workerPromiseShopVia})
                }
                break;
            case 'Facebook' :
                data?.forEach(async(account) => {
                    if(account.status == 'Không hoạt động') {
                        SELENIUM_ARRAY.push((account))
                        ResponseController.replyFacebookAccountData({id: account.id, status: 'Trong hàng chờ'}, event.sender)
                    }
                    else {
                        ResponseController.replyFacebookAccountData({id: account.id, code: 500}, event.sender)
                    }
                })
                if(SELENIUM_ARRAY.length > 0) {
                    if(options.autoProxy?.length > 0) {
                        new Promise((resolve, rejects) => {
                            const worker =  new Worker('./src/worker/worker.proxy.js', {
                                workerData: options.autoProxy
                            })
                            worker.on('message', (value) => {
                                const proxies = value
                                options.autoProxy = proxies
                                backtrackWorking({total_thread: options.totalThread, event, options,mainOptions, callback: workerPromiseFacebook})
                                worker.terminate()
                            })
                        })
                    }
                    else {
                        backtrackWorking({total_thread: options.totalThread, event, options,mainOptions, callback: workerPromiseFacebook})
                    }
                }
                event.sender.send('selenium:offReplyFacebookAccountData')
                break;
            default:
                break;
        }
    }
    
    const createSettingWindow = async () => {
        //setting response funtion define
        
        const advancedSettingWin = new BrowserWindow({
            height:600,
            width:900,
            parent: win,
            title: "Cài đặt nâng cao",
            show: false,
            icon: path.join(__dirname, './assets/images/app_icon.png'),
            webPreferences: {
                preload: path.join(__dirname, './preload/preload.setting.js')
            }
        })
        advancedSettingWin.loadFile('src/childWindow/advancedSetting/index.html')
        advancedSettingWin.on('ready-to-show', () => {
            advancedSettingWin.show()
        })
        advancedSettingWin.on('window-all-closed', () => {
            if(process.platform !== 'darwin') app.quit()
            globalShortcut.unregisterAll()  
        })
        ipcMain.handle('setting:getSavePath', getSavePath)
        ipcMain.handle('setting:saveSetting', saveConfig)
        ipcMain.handle('setting:changeSelectedSetting', changeSelectedSetting)
    }

    const createOrderHistoryWindow = async (sender, username, fileName) => {
        const HistoryWindow = new BrowserWindow({
            height:600,
            width:900,
            parent: win,
            title: `Lịch sử mua hàng của ${username}`,
            show: false,
            icon: path.join(__dirname, './assets/images/app_icon.png'),
            webPreferences: {
                preload: path.join(__dirname, './preload/preload.orderHistory.js')
            }
        })
        HistoryWindow.loadFile('src/childWindow/orderHistory/index.html')
        HistoryWindow.on('ready-to-show', () => {
            HistoryWindow.show()
            const value = {
                username: username,
                fileName: fileName
            }
            HistoryWindow.webContents.send('window:setupData', value)
        })
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

    
    win.loadFile('src/index.html')
    ipcMain.handle('setting:changeSelectedSetting', changeSelectedSetting)
    //ipcMain handle
    ipcMain.handle('file:insertAccount', handleInsertAccount)
    ipcMain.handle('selenium:startAction', handleSeleniumStartAction)
    //ipcMain_app handle
    ipcMain.handle('app:openAdvancedSetting', createSettingWindow)
    ipcMain.handle('app:openOrderHistory', createOrderHistoryWindow)
    // const openDevTool = globalShortcut.register("Alt+A", () => {
    //     // const focusedWindow = BrowserWindow.getFocusedWindow()
    //     console.log('shortcut')
        
    //     // console.log
    // })
    // if(!globalShortcut.isRegistered("Alt+A") || !openDevTool)
    // console.log('not register')    

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

    createBrowserWindow()

    app.on("activate", () => {
        if(BrowserWindow.getAllWindows().length === 0) createBrowserWindow()
    })
})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') app.quit()
    globalShortcut.unregisterAll()  
})