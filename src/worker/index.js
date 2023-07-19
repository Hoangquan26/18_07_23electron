const { parentPort } = require('node:worker_threads')
const SeleniumAction = require('../controller/controller.selenium.js')
const { setTimeout } = require('timers/promises')
class Worker {
    static checkViaSo = async({id, username, password, newpass = "", changepass = false, proxy = ""}) => {
        try {
            SeleniumAction.checkViaSo({id, username, password, newpass, changepass, proxy})
            .then(data => {
                parentPort.postMessage(data)
            })
        }
        catch(err) {
            console.log(err)
        }
    }
}

module.exports = Worker