const { screen, app } = require('electron')
const { setTimeout }  = require('timers/promises')
const path = require('path')
const { By, Key, Browser, Builder, until } = require('selenium-webdriver')
const { workerData } = require('worker_threads')
const ResponseController = require('./controller.response')
const FileController = require('./controller.file')
const RequestController = require('./controller.request')
const chrome = require('selenium-webdriver/chrome')
const proxy = require('selenium-webdriver/proxy')
const VIASO_ACCOUNT_PATH = path.join(__dirname, '../../acconts/account.viaso1.txt')
const CLONEFB_ACCOUNT_PATH = path.join(__dirname, '../../acconts/account.clonefb.txt')
const {
    getCurrentSetting,
    getIndexCurrentSetting
} = require('./controller.setting')

let screenDimensions = null
let screenSize = null
let windowHeigth = null
let windowWidth = null
app.on('ready', () => {
    screenDimensions =  screen.getPrimaryDisplay()
    screenSize = screenDimensions.size
    windowHeigth = screenSize.height / 2.0
    windowWidth = screenSize.width / 4.0
})
class SeleniumAction {

    
    static PrepareLocations = () => {
        const currentSetting = getIndexCurrentSetting()
        return getCurrentSetting(currentSetting.name)
    }    

    static checkViaSo = async (
    {account,
    sender, 
    options = {
        newPass,        
        changePassword,
        normalProxy: 'Không dùng',
        startDelay: 1,
        endDelay: 3,
        headless: false
    },
    position,
    shopViaOptions
    }) => {
        const locations = SeleniumAction.PrepareLocations()
        const savePath = locations.login_web_path_location.location.includes('clonefb') ? CLONEFB_ACCOUNT_PATH : VIASO_ACCOUNT_PATH
        let changePassStatus = false
        const normalProxy = options.normalProxy
        let chromeOptions = new chrome.Options()
        chromeOptions.setPageLoadStrategy('eager')
        if(options.normalProxy.length > 0) {
            chromeOptions.setProxy(proxy.manual({https: normalProxy}))
        }
        if(options.headless) {
            chromeOptions.addArguments('--headless')
        }
        if(options.userAgent.length > 0) {
            chromeOptions.addArguments(`--user-agent=${options.userAgent}`)
        }
        const {id, username, password} = account
        ResponseController.replyAccountData({id, money: 'Đang kiểm tra', status: 'Đang đăng nhập', proxy: normalProxy || 'Không dùng'}, sender)
        let res = {}
        let driver = await new Builder().forBrowser('chrome' || Browser.CHROME).setChromeOptions(chromeOptions).build()
        // driver.get('https://check-host.net')
        // await setTimeout(2000)
        // await driver.manage().window().setSize(700, 400)
        // await driver.manage().window().setPosition((position % 4) * windowWidth , ((position) % (4 /2)) * windowHeigth )
        driver.manage().window().setRect({width: windowWidth, height: windowHeigth, x: (position % 4) * windowWidth, y : ((position) % (4 /2)) * windowHeigth })
        driver.get(locations.login_web_path_location.location.replace("/login", ""))
        try {
            await driver.wait(until.urlIs(locations.login_web_path_location.location)).then(async() => {
                driver.findElement(By[locations.username_input_location.type](locations.username_input_location.location)).sendKeys(username)
                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                driver.findElement(By[locations.password_input_location.type](locations.password_input_location.location)).sendKeys(password)
                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                driver.findElement(By[locations.login_button_location.type](locations.login_button_location.location)).click()
                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                ResponseController.replyAccountData({id, money: 'Đang kiểm tra', status: 'Đã đăng nhập', proxy: normalProxy || 'Không dùng'}, sender)
                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                if((await driver.getCurrentUrl()).toString() == locations.login_web_path_location.location) {
                    ResponseController.replyAccountData({id, money: 'Chưa kiểm tra', status: 'Sai mật khẩu', proxy: normalProxy || 'Không dùng'}, sender)
                    FileController.ReplaceAccountData({filename: savePath , username, money: 'Chưa kiểm tra', status: 'Sai mật khẩu'})
                    throw Error('Sai mật khẩu'.toString('utf-8'))
                }
                driver.get(locations.account_web_path_location.location)
                await driver.wait(until.urlIs(locations.account_web_path_location.location)).then(async() => {
                    await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                    const accountMoney = await driver.executeScript(`return document.querySelector('${locations.balance_location.location}').textContent`)
                    console.log(accountMoney)
                    if(accountMoney) {
                        res = {
                            code: 200,
                            data : accountMoney
                        }
                        if(shopViaOptions.saveShopingHistory) {
                            ResponseController.replyAccountData({id, money: accountMoney + 'VNĐ', status: 'Đang lấy lịch sử', proxy: normalProxy || 'Không dùng'}, sender)
                            const pageSource = (await driver.getPageSource()).toString()
                            const regex = /'X-CSRF-TOKEN': '([^']+)/
                            const X_CSRF_TOKEN = regex.exec(pageSource)[1]
                            let cookie_str = ''
                            let listCookie = await driver.manage().getCookies()
                            listCookie = listCookie.reverse()
                            listCookie.forEach(cookie => {
                                cookie_str = cookie_str + (cookie.name + '=' + cookie.value + ';') 
                            })
                            const api_key = await RequestController.getApiKey(X_CSRF_TOKEN, cookie_str)
                            RequestController.getListOrders(api_key, 'https://clonefb.vn/api/v1/orders')
                            .then(data => {
                                console.log('list order------',data)
                                FileController.saveOrders(api_key, data, 'clonefb.via', username)
                                ResponseController.replyAccountData({id, money: accountMoney + 'VNĐ', status: 'Lấy lịch sử thành công', proxy: normalProxy || 'Không dùng', savedHistory: true}, sender)
                            })
                        }
                        if(options.changePassword) {
                            try {
                                ResponseController.replyAccountData({id, money: accountMoney + 'VNĐ', status: 'Đang đổi mật khẩu', proxy: normalProxy || 'Không dùng'}, sender)
                                driver.findElement(By[locations.repass_input_location.type](locations.repass_input_location.location)).sendKeys(password)
                                driver.findElement(By[locations.newpass_input_location.type](locations.newpass_input_location.location)).sendKeys(options.newPass)
                                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                                driver.findElement(By[locations.confirm_password_input_location.type](locations.confirm_password_input_location.location)).sendKeys(options.newPass)
                                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000) 
                                driver.findElement(By[locations.submit_password_input_location.type](locations.submit_password_input_location.location)).click()
                                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000) 
                                ResponseController.replyAccountData({id, money: accountMoney + 'VNĐ', status: 'Đổi mật khẩu thành công', proxy: normalProxy || 'Không dùng'}, sender)
                                changePassStatus = true
                            }
                            catch {
                                ResponseController.replyAccountData({id, money: accountMoney + 'VNĐ', status: 'Đổi mật khẩu thất bại', proxy: normalProxy || 'Không dùng'}, sender)
                                changePassStatus = false
                            }
                        }
                        await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000) 
                        if(changePassStatus) {
                            ResponseController.replyAccountData({id, money: accountMoney + 'VNĐ', status: 'Kiểm tra thành công', proxy: normalProxy || 'Không dùng', newPass: options.newPass}, sender)
                            FileController.ReplaceAccountData({filename: savePath , username, money: accountMoney + ' VNĐ', newpass: options.newPass})
                        }
                        else {
                            ResponseController.replyAccountData({id, money: accountMoney + 'VNĐ', status: 'Kiểm tra thành công', proxy: normalProxy || 'Không dùng'}, sender)
                            FileController.ReplaceAccountData({filename: savePath , username, money: accountMoney + ' VNĐ'})
                        }
                    }
                    else {
                        res = {
                            status: 500,
                            data : ''
                        }
                    }
                })
            })
        }
        catch(err){
            console.log(err)
            res = {
                status: 500,
                data : err
            }
        }
        finally{
            driver.close()
        }
        return res 
    }

    static workingWithFacebook = async ({
        account,
        sender, 
        options = {
            newPass,        
            changePassword,
            normalProxy: 'Không dùng',
            startDelay: 1,
            endDelay: 3,
            headless: false
        },
        position,
        callback
    }) => {

    }
}


module.exports = SeleniumAction