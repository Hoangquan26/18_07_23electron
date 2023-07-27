const { screen, app } = require('electron')
const { setTimeout }  = require('timers/promises')
const path = require('path')
const { By, Key, Browser, Builder, until } = require('selenium-webdriver')
const { workerData } = require('worker_threads')
const ResponseController = require('./controller.response')
const FileController = require('./controller.file')
const RequestController = require('./controller.request')
const CookieController = require('./controller.cookie')
const chrome = require('selenium-webdriver/chrome')
const proxy = require('selenium-webdriver/proxy')
const VIASO_ACCOUNT_PATH = path.join(__dirname, '../../acconts/account.viaso1.txt')
const CLONEFB_ACCOUNT_PATH = path.join(__dirname, '../../acconts/account.clonefb.txt')
const FACEBOOK_ACCOUNT_PATH = path.join(__dirname, '../../acconts/account.facebook.txt')
 
const {
    getCurrentSetting,
    getIndexCurrentSetting
} = require('./controller.setting')
const { urlContains } = require('selenium-webdriver/lib/until')

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

    static createDriver = async (options, useDataDir = false, username = null) => {
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
        if(useDataDir) {
            chromeOptions.addArguments(`--user-data-dir=C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data\\${username}`)
        }
        chromeOptions.addArguments('--disable-notifications');
        let driver = await new Builder().forBrowser('chrome' || Browser.CHROME).setChromeOptions(chromeOptions).build()
        // driver.get(locations.login_web_path_location.location.replace("/login", ""))
        return {
            driver: driver,
            normalProxy: normalProxy
        }
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
        const {id, username, password} = account
        let res = {}
        let changePassStatus = false
        const { driver, normalProxy} = await this.createDriver(options)
        driver.manage().window().setRect({width: windowWidth, height: windowHeigth, x: (position % 4) * windowWidth, y : ((position) % (4 / 2)) * windowHeigth })
        ResponseController.replyAccountData({id, money: 'Đang kiểm tra', status: 'Đang đăng nhập', proxy: normalProxy || 'Không dùng'}, sender)
       
        
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
                    const notify_location = locations.notify_location.location.split('|')
                    notify_location.forEach(async(notify) => {
                        try{
                            console.log(notify)
                            const element = await driver.findElement(By.css(notify))
                            element.click()
                        }
                        catch (e){
                            console.log(e)
                        }
                        // console.log(notify)
                        // await driver.executeScript(`document.querySelectorAll("${notify}").forEach(item => item.remove())`)
                    })
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
                            const api_key = await RequestController.getApiKey(X_CSRF_TOKEN, cookie_str, locations.api.api_key)
                            RequestController.getListOrders(api_key, locations.api.list_order)
                            .then(data => {
                                // FileController.saveOrders(api_key, data, 'clonefb.via', username, locations.api.order_detail)
                                FileController.saveOrders(api_key, data, locations.history_web_path_location.location, username, locations.api.order_detail)
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
            await setTimeout(10000)
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
    static rememberBrowser =async (driver, options) => {
        await driver.wait(until.elementsLocated(By.css("input[type='radio'][name='name_action_selected'][value='dont_save']")), 30000)
        await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
        driver.findElement(By.css("input[type='radio'][name='name_action_selected'][value='dont_save']")).click()
        await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
        driver.findElement(By.id('checkpointSubmitButton-actual-button')).click()
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
        facebookOptions,
        position,
        callback
    }) => {
        try {
            const { id, username, password, _2fa, mail, passmail, cookie, status} = account
            console.log(id, username, password, _2fa, mail, passmail, cookie, status, facebookOptions)
            if(status != 'Không hoạt động') {
                ResponseController.replyFacebookAccountData({code: 500, id}, sender)
                return
            }
            const { driver, normalProxy} = await this.createDriver(options, facebookOptions.useDataDir, username)
            ResponseController.replyFacebookAccountData({id, status: 'Đang đăng nhập', proxy: options.normalProxy}, sender)
            const fbPath = facebookOptions.fbStartPage == 'mbasic.facebook.com' ? 'https://mbasic.facebook.com' : 'https://www.facebook.com'
            await driver.get(fbPath)
            await driver.wait(until.titleContains('log in or sign up'), 20000)
            .then(async() => {
                if(!cookie) {
                    await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                    driver.findElement(By.id("m_login_email")).sendKeys(username)
                    driver.findElement(By.css("#password_input_with_placeholder>input")).sendKeys(password)   
                    await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                    driver.findElement(By.css("input[value='Log In'][type='submit'][name='login']")).click()
                    ResponseController.replyFacebookAccountData({id, status: 'Đang nhập 2fa'}, sender)
                    while(true) {
                        const _2faCode = RequestController.get2faCode(_2fa)
                        await driver.wait(until.urlContains('checkpoint'))
                        await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                        driver.findElement(By.id('approvals_code')).sendKeys(_2faCode)
                        await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                        driver.findElement(By.id('checkpointSubmitButton-actual-button')).click()
                        try {
                            await driver.wait(until.urlContains('/login/checkpoint'))
                            SeleniumAction.rememberBrowser(driver, options)
                            break;
                        }
                        catch (err) {
                            console.log(err)
                            ResponseController.replyFacebookAccountData({id, status: 'Sai 2fa, đang check lại'}, sender)
                        }
                    }
                    await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                    let url = await driver.getCurrentUrl()
                    const cookie = await driver.manage().getCookies()
                    if(!cookie['c_user']){
                        if(url.includes('login/checkpoint')) {
                            while(driver.findElement(By.id('checkpointSubmitButton-actual-button'))) {
                                await driver.findElement(By.id('checkpointSubmitButton-actual-button')).click()
                                await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                            }
                            SeleniumAction.rememberBrowser(driver, options)

                        }
                        else if(url.includes('checkpoint' && !url.includes('956') && !url.includes('282'))) {
                            try {
                                ResponseController.replyFacebookAccountData({id, status: 'Acc checkpoint'}, sender)
                                await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                                driver.findElement(By.id('checkpointSubmitButton-actual-button')).click()
                                await driver.wait(until.elementLocated(By.id('checkpointSubmitButton-actual-button')))
                                .then(element => element.click())
                                rememberBrowser(driver, options)
                            }
                            catch {
                                ResponseController.replyFacebookAccountData({id, status: 'Giải fail'}, sender)
                            }
                        }
                        else if(url.includes('956')) {
                            try {
                                ResponseController.replyFacebookAccountData({id, status: 'Checkpoint 956'}, sender)
                                await driver.findElement(By.css('#root > table > tbody > tr > td > div > div.bg > a')).click()
                                await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                                await driver.findElement(By.css('#root > table > tbody > tr > td > div > div > a')).click()
                                await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                                await driver.findElement(By.css("input[type='submit']")).click()
                                await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                                await driver.findElement(By.css("input[type='submit']")).click()
                                await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                                await driver.findElement(By.css("input[type='text']")).sendKeys('...')
                                await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                                await driver.findElements(By.css("input[type='submit']"))[1].click()
                            }
                            catch {
                                
                            }
                        }
                    } 
                    else if(url.includes('home.php') || url.includes('gettingstarted') || cookie['c_user']) {
                        const str_cookie =  CookieController.convertJsonCookieToText(cookie)
                        ResponseController.replyFacebookAccountData({id, status: 'Đăng nhập thành công'}, sender)
                        ResponseController.replyFacebookAccountData({id, status: 'Đang lấy cookie'}, sender)
                        FileController.ReplaceFacebookAccountData({filename: FACEBOOK_ACCOUNT_PATH, cookie: str_cookie, username})
                        ResponseController.replyFacebookAccountData({id, status: 'Lấy cookie thành công' , cookie: str_cookie}, sender)
                    }
                }
                else {
                    await driver.wait(until.elementLocated(By.id("m_login_email")))
                    const cookies = CookieController.convertTextCookieToList(cookie)
                    try {
                        await Promise.all(cookies.forEach(async(item) => {
                            await driver.manage().addCookie({
                                ...item,
                                domain: '.facebook.com'
                            })
                        }))
                    }
                    catch(err) {
                        console.log(err.cause, err.message)
                    }
                    await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                    await driver.navigate().refresh()
                    driver.wait(until.elementLocated(By.id('m_news_feed_stream')))
                    .then(() => {
                        ResponseController.replyFacebookAccountData({id, status: 'Đăng nhập thành công'}, sender)

                    })
                    .catch(err => {
                        ResponseController.replyFacebookAccountData({id, status: 'Đăng nhập thất bại'}, sender)
                    })
                    await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 10000)
                }
            })
            .catch(async(err) => {
                console.log(err)
                let currentUrl = await driver.getCurrentUrl()
                if(currentUrl.includes(fbPath.replace('facebook.com', '') && !currentUrl.includes('login') && currentUrl.includes('checkpoint')))
                    ResponseController.replyFacebookAccountData({id, status: currentUrl, proxy: options.normalProxy, code: 202}, sender)
            })
            .finally(async() => {
                await setTimeout((Math.floor(Math.random() * options.endDelay) + options.startDelay) * 1000)
                ResponseController.replyFacebookAccountData({id, status: 'Hoàn thành', proxy: options.normalProxy, code: 202}, sender)
                driver.close()
            })
        }
        catch(err) {
            console.log(err)
            ResponseController.replyFacebookAccountData({id: account.id, status: 'Trình duyệt bị đóng', code: 202}, sender)
        }
        
    }
}


module.exports = SeleniumAction