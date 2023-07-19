const { setTimeout }  = require('timers/promises')
const path = require('path')
const { By, Key, Browser, Builder, until } = require('selenium-webdriver')
const { workerData } = require('worker_threads')
const ResponseController = require('./controller.response')
const FileController = require('./controller.file')

const VIASO_ACCOUNT_PATH = path.join(__dirname, '../../acconts/account.viaso1.txt')

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

    static checkViaSo = async ({id, username, password, newpass = "", changepass = false, proxy = ""}, sender) => {
        ResponseController.replyAccountData({id, money: 'Đang kiểm tra', status: 'Đang đăng nhập'}, sender)
        let res = {}
        let driver = await new Builder().forBrowser('chrome' || Browser.CHROME).build()
        driver.get('https://viaso1.com/')
        try {
            await driver.wait(until.titleContains('Cung Cấp Via Cổ, Via XMDT')).then(async() => {
                driver.findElement(By.id('login-username')).sendKeys(username)
                await setTimeout(1000)
                driver.findElement(By.id('login-password')).sendKeys(password)
                await setTimeout(1000)
                driver.findElement(By.css('.btn.btn-hero-primary')).click()
                await setTimeout(1000)
                ResponseController.replyAccountData({id, money: 'Đang kiểm tra', status: 'Đã đăng nhập'}, sender)
                if((await driver.getCurrentUrl()).toString() == 'https://viaso1.com/login') {
                    ResponseController.replyAccountData({id, money: 'Chưa kiểm tra', status: 'Sai mật khẩu'}, sender)
                    FileController.ReplaceAccountData({filename: VIASO_ACCOUNT_PATH.toString() , username, money: 'Chưa kiểm tra', status: 'Sai mật khẩu'})
                    throw Error('Sai mật khẩu'.toString('utf-8'))
                }
                driver.get('https://viaso1.com/account')
                await driver.wait(until.urlIs('https://viaso1.com/account')).then(async() => {
                    await setTimeout(1000)
                    const accountMoney = await driver.executeScript("return document.querySelector('div.row.justify-content-center > div > div > div.block-content > div:nth-child(2) > div > div:nth-child(4) > div > span > strong').textContent")
                    if(accountMoney) {
                        ResponseController.replyAccountData({id, money: accountMoney + 'VNĐ', status: 'Kiểm tra thành công'}, sender)
                        res = {
                            code: 200,
                            data : accountMoney
                        }
                        FileController.ReplaceAccountData({filename: VIASO_ACCOUNT_PATH.toString() , username, money: accountMoney + ' VNĐ'})
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