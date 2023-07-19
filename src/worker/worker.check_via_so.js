const Worker = require('./index')
const { workerData, parentPort } = require('node:worker_threads')
const SeleniumAction = require('../controller/controller.selenium')
console.log(workerData)
const tester = async (workerData) => {
    // const data = await SeleniumAction.checkViaSo(workerData)
    // parentPort.postMessage(data)
    console.log('heelo')
} 

tester(workerData)