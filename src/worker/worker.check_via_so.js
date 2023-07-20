const Worker = require('./index')
const { workerData, parentPort } = require('node:worker_threads')
const SeleniumAction = require('../controller/controller.selenium')
console.log(workerData)


const {options, account, event, proxies} = workerData

    const proxy = options.normalProxy ? options.normalProxy : proxies[Math.floor(Math.random() * proxies.length)]
    passOptions = {
        ...options,
        normalProxy: proxy,
        totalThread: null,
        autoProxy: null,
    }
    // SELENIUM_QUEUE++
    // const account = SELENIUM_ARRAY.shift()
    SeleniumAction.checkViaSo(account, sender= event, options = passOptions)
    .then((data) => {
        console.log(data)
        // SELENIUM_QUEUE--
    })
    // SELENIUM_QUEUE++
    // seleniumPromiseContructor(SELENIUM_ARRAY.shift())
    // const data = await seleniumPromiseContructor(SELENIUM_ARRAY.shift())
    // SELENIUM_QUEUE--


// const startWorking = ({options, account, event, proxies}) => {
//     while(SELENIUM_ARRAY.length > 0) {
//         if(SELENIUM_QUEUE < options.totalThread){
//             const proxy = options.normalProxy ? options.normalProxy : proxies[Math.floor(Math.random() * proxies.length)]
//             passOptions = {
//                 ...options,
//                 normalProxy: proxy,
//                 totalThread: null,
//                 autoProxy: null,
//             }
//             SELENIUM_QUEUE++
//             const account = SELENIUM_ARRAY.shift()
//             SeleniumAction.checkViaSo(account, event.sender, options = passOptions)
//             .then((data) => {
//                 console.log(data)
//                 SELENIUM_QUEUE--
//             })
//             // SELENIUM_QUEUE++
//             // seleniumPromiseContructor(SELENIUM_ARRAY.shift())
//             // const data = await seleniumPromiseContructor(SELENIUM_ARRAY.shift())
//             // SELENIUM_QUEUE--
//         }
//     }
// }

tester(workerData)