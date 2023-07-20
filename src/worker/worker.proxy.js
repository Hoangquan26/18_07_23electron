const { parentPort, workerData} = require('worker_threads')
const ProxyController = require('../controller/controller.proxy')

console.log(workerData)
ProxyController.autoGetListProxy(workerData, 1)
.then(data => {
    parentPort.postMessage(data)
})