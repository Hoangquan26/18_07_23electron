const { screen, app } = require('electron')
const { setTimeout }  = require('timers/promises')
const path = require('path')
const { By, Key, Browser, Builder, until } = require('selenium-webdriver')
const { workerData } = require('worker_threads')
const ResponseController = require('./controller.response')
const FileController = require('./controller.file')
const chrome = require('selenium-webdriver/chrome')
const proxy = require('selenium-webdriver/proxy')
const { urlIs } = require('selenium-webdriver/lib/until')
const VIASO_ACCOUNT_PATH = path.join(__dirname, '../../acconts/account.viaso1.txt')


let screenDimensions = null
let screenSize = null
let windowHeigth = null
let windowWidth = null
app.on('ready', () => {
    screenDimensions =  screen.getPrimaryDisplay()
    screenSize = screenDimensions.size
    console.log(screenSize)
    windowHeigth = screenSize.height / 2.0
    windowWidth = screenSize.width / 4.0
})
class SeleniumAction {
    static checkAccount = async ({username, password, newpass = false, changepass ="", proxy = ""}) => {
        let driver = await new Builder().forBrowser(Browser.CHROME).build()
        driver.get('https://via2fa.com/profile')
        await driver.wait(until.elementIsVisible(driver.findElement(By.css('.btn.btn-primary.off-popup'))))
        const ignorePopup = driver.findElement(By.css('.btn.btn-primary.off-popup'))
        ignorePopup.click()

        driver.wait(until.elementIsVisible(driver.findElement(By.css('.swal2-confirm.btn.btn-success')))).then(element => {
            element.click()
        } )
        .catch(err => {
            console.log(err)
        })
        // const closeIgnorePopup = driver.findElement(By.css('.swal2-confirm.btn.btn-success'))
        // closeIgnorePopup.click()
        // await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('/html/body/div/div/div/div/div/div/div/div/div[1]/div/div[1]/div[3]/div[2]/div/div'))))
        // const closeMessengerPoup = driver.findElement(By.xpath('/html/body/div/div/div/div/div/div/div/div/div[1]/div/div[1]/div[3]/div[2]/div/div'))
        // closeMessengerPoup.click()
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
    position
    }) => {
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
        driver.manage().window().setRect({width: windowWidth, height: windowHeigth, x: (position % 4) * windowWidth, y : ((position) % (4 /2)) * windowHeigth })
        driver.get('https://viaso1.com/')
        // await driver.manage().window().setSize(700, 400)
        // await driver.manage().window().setPosition((position % 4) * windowWidth , ((position) % (4 /2)) * windowHeigth )
        try {
            await driver.wait(until.titleContains('Cung Cấp Via Cổ, Via XMDT')).then(async() => {
                driver.findElement(By.id('login-username')).sendKeys(username)
                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                driver.findElement(By.id('login-password')).sendKeys(password)
                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                driver.findElement(By.css('.btn.btn-hero-primary')).click()
                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                ResponseController.replyAccountData({id, money: 'Đang kiểm tra', status: 'Đã đăng nhập', proxy: normalProxy || 'Không dùng'}, sender)
                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                if((await driver.getCurrentUrl()).toString() == 'https://viaso1.com/login') {
                    ResponseController.replyAccountData({id, money: 'Chưa kiểm tra', status: 'Sai mật khẩu', proxy: normalProxy || 'Không dùng'}, sender)
                    FileController.ReplaceAccountData({filename: VIASO_ACCOUNT_PATH.toString() , username, money: 'Chưa kiểm tra', status: 'Sai mật khẩu'})
                    throw Error('Sai mật khẩu'.toString('utf-8'))
                }
                driver.get('https://viaso1.com/account')
                await driver.wait(until.urlIs('https://viaso1.com/account')).then(async() => {
                    await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                    const accountMoney = await driver.executeScript("return document.querySelector('div.row.justify-content-center > div > div > div.block-content > div:nth-child(2) > div > div:nth-child(4) > div > span > strong').textContent")
                    if(accountMoney) {
                        res = {
                            code: 200,
                            data : accountMoney
                        }
                        if(options.changePassword) {
                            try {
                                ResponseController.replyAccountData({id, money: accountMoney + 'VNĐ', status: 'Đang đổi mật khẩu', proxy: normalProxy || 'Không dùng'}, sender)
                                driver.findElement(By.name('current_password')).sendKeys(password)
                                driver.findElement(By.name('password')).sendKeys(options.newPass)
                                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000)
                                driver.findElement(By.name('password_confirmation')).sendKeys(options.newPass)
                                await setTimeout(Math.floor((Math.random() * options.endDelay) + options.startDelay) * 1000) 
                                driver.findElement(By.css("button.btn.btn-primary[type='submit']")).click()
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
                            FileController.ReplaceAccountData({filename: VIASO_ACCOUNT_PATH.toString() , username, money: accountMoney + ' VNĐ', newpass: options.newPass})
                        }
                        else {
                            ResponseController.replyAccountData({id, money: accountMoney + 'VNĐ', status: 'Kiểm tra thành công', proxy: normalProxy || 'Không dùng'}, sender)
                            FileController.ReplaceAccountData({filename: VIASO_ACCOUNT_PATH.toString() , username, money: accountMoney + ' VNĐ'})
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
}


module.exports = SeleniumAction