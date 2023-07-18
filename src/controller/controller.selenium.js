const { By, Key, Browser, Builder, until } = require('selenium-webdriver')
class SeleniumAction {
    static checkAccount = async ({username, password, newpass = false, changepass ="", proxy = ""}) => {
        let driver = await new Builder().forBrowser(Browser.CHROME).build()
        driver.get('https://via2fa.com/profile')
        driver.wait(until.elementIsVisible(driver.findElement(By.css('.btn.btn-primary.off-popup'))))
        const ignorePopup = driver.findElement(By.css('.btn.btn-primary.off-popup'))
        ignorePopup.click()
        try {
            driver.wait(until.elementIsVisible(driver.findElement(By.css('.swal2-confirm.btn.btn-success'))))
            const closeIgnorePopup = driver.findElement(By.css('.swal2-confirm.btn.btn-success'))
            closeIgnorePopup.click()
        }
        catch {
            console.log('unfined css')
        }
        try {
            driver.wait(until.elementIsVisible(driver.findElement(By.xpath('/html/body/div/div/div/div/div/div/div/div/div[1]/div/div[1]/div[3]/div[2]/div/div'))))
            const closeMessengerPoup = driver.findElement(By.xpath('/html/body/div/div/div/div/div/div/div/div/div[1]/div/div[1]/div[3]/div[2]/div/div'))
            closeMessengerPoup.click()
        }
        catch {
            console.log('unfined xpath')
        }
    }    
}

module.exports = SeleniumAction