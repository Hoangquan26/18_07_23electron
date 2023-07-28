const body_config_close_btn = document.querySelector(".body_config--action")
const blur = document.querySelector('.blur')
const body_config = document.querySelector('.body_config')
body_config_close_btn.addEventListener('click', () => {
    if(body_config_close_btn.classList.contains('close')) {
        body_config_close_btn.classList.remove('close')
        body_config_close_btn.classList.add('open')
        body_config.classList.remove('open')
        blur.classList.add('none')
        body_config_close_btn.innerHTML = `<i class='bx bx-cog' ></i>`
    }
    else {
        body_config_close_btn.classList.add('close')
        body_config_close_btn.classList.remove('open')
        body_config.classList.add('open')
        blur.classList.remove('none')
        body_config_close_btn.innerHTML = `<i class='bx bx-x'></i>`
    }
})
blur.addEventListener('click', (e) => {
    body_config_close_btn.classList.remove('close')
    body_config_close_btn.classList.add('open')
    body_config.classList.remove('open')
    blur.classList.add('none')
    body_config_close_btn.innerHTML = `<i class='bx bx-cog' ></i>`
})

document.querySelector('.body_config_advance_btn').addEventListener('click', () => {
    window.appActions.openAdvancedSetting()
})

// end handle toogle body_config

// handle ui proxy session

const radioProxies = document.querySelectorAll("input[type='radio'][name='proxy_type']")
const proxyPaths = document.querySelectorAll("input[type='text'][name='proxy_path']")
const accountsPerProxy = document.getElementsByName('proxy_per_account')[0]
radioProxies[0].addEventListener('click', (e) => {
    proxyPaths[1].disabled = true
    proxyPaths[0].disabled = false
    proxyPaths[0].value = 'http://192.168.1.7:22022/#/device-list/index'
    proxyPaths[1].value = ''
    accountsPerProxy.disabled = false
    accountsPerProxy.value = 1
})
radioProxies[1].addEventListener('click', (e) => {
    proxyPaths[1].disabled = false
    proxyPaths[0].disabled = true
    proxyPaths[0].value = ''
    accountsPerProxy.disabled = true
    accountsPerProxy.value = null
})

//define user ui: select account
const account_table_rows = document.querySelectorAll('.account_table tr')

const selectedRow = (item) => {
    item.classList.toggle('row_selected')
}

const selectedWithoutCtrl = (item) => {
    document.querySelectorAll('.row_selected').forEach((ele) => {
        if(ele != item)
            ele.classList.remove('row_selected')
    })
    item.classList.toggle('row_selected')
}
const selectedFunctionConstructor = (element) => {
    if(!element.classList.contains('disabled_row')) {
        element.addEventListener('click', (e) => {
            if(e.button == 0) {
                e.ctrlKey ? selectedRow(element) : selectedWithoutCtrl(element)
            }
        })
    }
}

account_table_rows.forEach(element => {
    selectedFunctionConstructor(element)
})

const getAllShopViaSelectedAccount = () => {
    return document.querySelectorAll('.account_table .row_selected')
}

const getAllFacebookSelectedAccount = () => {
    return document.querySelectorAll('.facebook_account_table .row_selected')
}


//handle input ui

// Optional JavaScript code (if needed)
// You can use this script to handle events or perform actions when the toggle button is clicked.
const toggleButton = document.getElementById("toggle");


const data_dir_toggle = document.getElementById('toggle_data_dir')


const delay_start_input = document.getElementsByName('delay_start')[0]
const delay_end_input = document.getElementsByName('delay_end')[0]
delay_start_input.addEventListener('change', (e) => {
    if(delay_start_input.value == delay_end_input.value)
        delay_start_input.value = delay_end_input.value
})

delay_end_input.addEventListener('change', (e) => {
    if(delay_start_input.value == delay_end_input.value)
        delay_end_input.value = delay_start_input.value 
})

const new_pass_input = document.getElementsByName('new_pass')[0]
new_pass_input.addEventListener('change', (e) => {
    if(e.target.value.length < 6 && e.target.value.length > 0)
        new_pass_input.classList.add('invalid')
    else 
        new_pass_input.classList.remove('invalid')
})


//insert account to table 

const handleErrorWhileResponse = (account_table, err, type) => {
    switch(type){
        case 'main_table':
            account_table.innerHTML =  `<tr class='disabled_row'>
                                    <th>Tài khoản</th>
                                    <th>Mật khẩu</th>
                                    <th>Số dư</th>
                                    <th>Trạng thái</th>
                                    <th></th>
                                </tr>
                                <tr class='disabled_row'>
                                    <td colspan="4" aria-colspan="4">
                                        <div class="none_account_image_wrapper">
                                            <img class="none_account_image" src="./assets/images/ErrorInserUser.png"/>
                                            <h3>Chưa có tài khoản</h3>
                                        </div>
                                    </td>
                                </tr>`
            break;
        case 'facebook_table' :
        document.querySelector('.facebook_account_table').innerHTML = `<tr class="disabled_row">
                                                <th>Tài khoản</th>
                                                <th>Mật khẩu</th>
                                                <th>2fa</th>
                                                <th>mail</th>
                                                <th>passmail</th>
                                                <th>cookie</th>
                                                <th>Trạng thái</th>
                                                <th>Proxy</th>
                                            </tr>
                                            <tr class="disabled_row"> 
                                                <td colspan="9" aria-colspan="4">
                                                <div class="none_account_image_wrapper">
                                                    <img class="none_account_image" src="./assets/images/NoneAccountExceptionjfif.jfif"/>
                                                    <h3>Chưa có tài khoản</h3>
                                                </div>
                                                </td>
                                            </tr>`
                break;
    }                                   
}

const fileSelector = document.getElementsByName('account_selection')[0]

fileSelector.addEventListener('click', async () => {
    const data = await window.fileActions.insertAccount('main_table')
})

window.seleniumActions.replyAccountData((_event, value) => {
    const {id, status, money, proxy, newPass, savedHistory, code} = value
    const row = document.getElementById(id)
    const chilren = row.childNodes
    
        if(money)
            chilren[2].textContent = money
        if(status)
            chilren[3].textContent = status
        if(proxy)
            chilren[4].textContent = proxy
        if(savedHistory) {
            chilren[5].classList.add('checked_history')
            chilren[5].classList.remove('unchecked_history')
        }
        if(newPass)
            chilren[1].textContent = newPass
    if(code == 500) {
        row.classList.add('warn')
        const id = setTimeout(() => {
            row.classList.remove('warn')
            clearTimeout(id)
        }, 3000)
        return
    }
    else if (code == 201) {
        row.classList.add('warn')
        const id = setTimeout(() => {
            row.classList.remove('warn')
            clearTimeout(id)
            chilren[3].textContent = 'Không hoạt động'
        }, 3000)
        return
    }
})

const showOrderHistory = (e ,name, fileName) => {
    e.stopPropagation()
    window.appActions.openOrderHistory(name, fileName)
}

const checkOrderHistory = async(configs) => {
    try {
        return await fetch(`../history/${configs}.via.json`)
        .then(data =>{
            const res = data.json()
            return res
        })
    }
    catch {
        return {}
    }
}

const toggle_account_filter = document.querySelector('#toggle_account_filter')
toggle_account_filter.addEventListener('change', () => {
    const account_table = document.querySelector('.account_table')
    if(toggle_account_filter.checked){
        account_table.querySelectorAll('.unchecked_history').forEach(item => {
            item.parentElement.classList.add('none')
        })
    }
    else{
        account_table.querySelectorAll('.none').forEach(item => {
            item.classList.remove('none')
        })
    }
})

window.fileActions.replyInsertAccount(async (_event, value) => {
    const account_table = document.querySelector('.account_table')
    const listOrderHistory = await checkOrderHistory(value.fileName)
    const facebook_account_table = document.querySelector('.facebook_account_table')
    console.log(value)
        if(value.status == 200) {
            switch(value.type) {
                case 'main_table':
                    try {
                        account_table.innerHTML =  `<tr class='disabled_row'>
                                                        <th>Tài khoản</th>
                                                        <th>Mật khẩu</th>
                                                        <th>Số dư</th>
                                                        <th>Trạng thái</th>
                                                        <th>Proxy</th>
                                                        <th></th>
                                                    </tr>`
                        res = value.res.trim().replace('\r', '').split('\n')
                        let i = 0;
                        res.forEach(async (account) =>{
                            const tr = document.createElement('tr')
                            const splitAccountData = account.split('|')
                            splitAccountData.forEach(item => {
                                const td = document.createElement('td')
                                td.textContent = item
                                tr.appendChild(td)
                            })
                            const proxyCol = document.createElement('td')
                            proxyCol.textContent = 'Không dùng'
                            const historyCol = document.createElement('td')
                            historyCol.addEventListener('click', (e) => {
                                if(historyCol.classList.contains('unchecked_history'))
                                    return
                                showOrderHistory(e, tr.childNodes[0].textContent, value.fileName)
                            })
                            // console.log(listOrderHistory[splitAccountData[0]], splitAccountData[0])
                            if(listOrderHistory[splitAccountData[0]] != null) {
                                historyCol.classList.add('history_check_btn', 'checked_history')
                            }
                            else {
                                if(toggle_account_filter.checked) {
                                    tr.classList.add('none')
                                }
                                historyCol.classList.add('history_check_btn', 'unchecked_history')
                            }
                            historyCol.innerHTML ="<a>Kiểm tra lịch sử</a>"
                            tr.append(proxyCol)
                            tr.append(historyCol)
                            selectedFunctionConstructor(tr)
                            tr.id = i++
                            account_table.appendChild(tr)
                        })
                    }
                    //refreah table
                    catch (err){
                        handleErrorWhileResponse(account_table, err)
                    }
                    break;
                case 'facebook_table':
                    try {
                        facebook_account_table.innerHTML =  `<tr class='disabled_row'>
                                                        <th>Tài khoản</th>
                                                        <th>Mật khẩu</th>
                                                        <th>2fa</th>
                                                        <th>mail</th>
                                                        <th>passmail</th>
                                                        <th>cookie</th>
                                                        <th>Trạng thái</th>
                                                        <th>Proxy</th>
                                                    </tr>`
                        res = value.res.trim().replace('\r', '').split('\n')
                        let i = 0;
                        res.forEach(account =>{
                            const tr = document.createElement('tr')
                            const splitAccountData = account.split('|')
                            const usernametd = document.createElement('td')
                            usernametd.textContent = splitAccountData[0]
                            const passwordtd = document.createElement('td')
                            passwordtd.textContent = splitAccountData[1]
                            const _2fatd = document.createElement('td')
                            _2fatd.textContent = splitAccountData[2]
                            const mailtd = document.createElement('td')
                            mailtd.textContent = splitAccountData[3]
                            const passmailtd = document.createElement('td')
                            passmailtd.textContent = splitAccountData[4]
                            const cookietd = document.createElement('td')
                            cookietd.textContent = splitAccountData[6]
                            cookietd.classList.add('text_overflow')
                            const statustd = document.createElement('td')
                            statustd.textContent = 'Không hoạt động'
                            const proxyCol = document.createElement('td')
                            proxyCol.textContent = 'Không dùng'
                            tr.append(usernametd, passwordtd, _2fatd, mailtd, passmailtd, cookietd, statustd, proxyCol)
                            selectedFunctionConstructor(tr)
                            tr.id = `fb${i++}`
                            facebook_account_table.append(tr)
                        })
                    }
                    //refreah table
                    catch (err){
                        console.log(err)
                        handleErrorWhileResponse(facebook_account_table, err)
                    }
                    break;
                default:
                    break;
            }
        }
        else{
            handleErrorWhileResponse(account_table, value.data)
        }
    })

//program action

const getShopViaOptions = () => {
    return {
        'saveShopingHistory' : document.getElementById('toggle_history_save').checked
    }
}
const run_program = document.querySelector('.run_program')
const stop_program = document.querySelector('.stop_program')

const getProgramSetting = () => {
    const options = {}
    options['path'] = document.getElementsByName('web_path')[0].value
    const proxy_chance = document.getElementsByName('proxy_type')
    if(proxy_chance[0].checked){
        options['autoProxy'] = document.getElementsByName('proxy_path')[0].value
        options['accountsPerProxy'] = parseInt(document.getElementsByName('proxy_per_account')[0].value)
    }
    else {
        options['normalProxy'] = document.getElementsByName('proxy_path')[1].value
    }
    options['startDelay'] = parseInt(document.getElementsByName('delay_start')[0].value)
    options['endDelay'] = parseInt(document.getElementsByName('delay_end')[0].value)
    options['totalThread'] = parseInt(document.getElementsByName('total_thread')[0].value)
    const new_pass = document.getElementsByName('new_pass')[0].value
    options['headless'] = document.getElementById('toggle').checked
    if(new_pass) {
        options['changePassword'] = true
        options['newPass'] = new_pass
    }
    options['userAgent'] = document.querySelector("input[name='user_agent']").value
    return options
}

stop_program.addEventListener('click', () => {
    let data = [] 
    getAllShopViaSelectedAccount().forEach(item => {
        const chilren = item.childNodes
        if(chilren[3].textContent != 'Không hoạt động')
            data.push({
                id: item.id
            })
    })
    // console.log(runningAccount)
    window.cmdActions.shutdownChrome(data)
})

const listConfigs = []
const startUp = document.querySelector('.startup_options')

startUp.addEventListener('change', e => {
    window.settingAction.changeSelectedSetting(e.target.value)
})
fetch('../configs/index.json')
.then(data => data.json())
.then(data => {
    data = data.listConfig
    listConfigs.push(data)
    data.forEach(config => {
        const options = document.createElement('option')
        options.textContent = config.name
        options.value = config.name
        if(config.selected) {
            currentConfig = config.name
        }
        startUp.append(options)
    })
    startUp.value = currentConfig
    return currentConfig
})


const getSendData = (callback) => {
    const rowData = callback()
    const sendData = []
    if(document.querySelector("input[name='web_path']").value == 'ShopVia')
        rowData.forEach((data) => {
            child = data.childNodes
            const id = data.id
            const username = child[0].textContent
            const password = child[1].textContent
            const status = child[3].textContent
            sendData.push({id, username, password, status})
        })
    else {
        rowData.forEach((data) => {
            child = data.childNodes
            const id = data.id
            const username = child[0].textContent
            const password = child[1].textContent
            const _2fa = child[2].textContent
            const mail = child[3].textContent
            const passmail = child[4].textContent
            const cookie = child[5].textContent
            const status = child[6].textContent
            sendData.push({id, username, password, _2fa, mail, passmail, cookie, status})
        })
    }
    return sendData
}

run_program.addEventListener('click', () => {
    //get option
    const options = getProgramSetting()
    //get accounts
    const sendData = getSendData(getAllShopViaSelectedAccount)
    //start task
    const shopViaOptions = getShopViaOptions()
    window.seleniumActions.startAction(sendData, options, shopViaOptions)
    // window.seleniumActions.startAction([{username: 'quannnn', password: '642003'}])
})

//facebookStart

//open facebook tab

const open_facebook_btn = document.querySelector('.facebook_icon')
open_facebook_btn.addEventListener('click', () => {
    document.querySelector('.onScreen').classList.remove('onScreen')
    document.querySelector('.facebook_body').classList.add('onScreen')
    document.querySelector("input[name='web_path']").value = 'Facebook'
})

const open_home_btn = document.querySelector('.home_icon')
open_home_btn.addEventListener('click', () => {
    document.querySelector('.onScreen').classList.remove('onScreen')
    document.querySelector('.main_body').classList.add('onScreen')
    document.querySelector("input[name='web_path']").value = 'ShopVia'
})

const open_history_btn = document.querySelector('.history_icon')
const shop_history_options = document.querySelector('.shop_history_options')
open_history_btn.addEventListener('click', () => {
    document.querySelector('.onScreen').classList.remove('onScreen')
    document.querySelector('.order_history_body').classList.add('onScreen')
    document.querySelector("input[name='web_path']").value = 'OrderHistory'


    window.fileActions.getOrderHistory()
    window.fileActions.replyOrderHistory((_event, value) => {
        shop_history_options.innerHTML = ''
        value.forEach(item => {
            const option = document.createElement('option')
            option.value = item
            option.textContent = item
            shop_history_options.append(option)
        })
    })
})
//facebook select account

const facebookFileSelector = document.getElementsByName('facebook_account_selection')[0]

facebookFileSelector.addEventListener('click', async () => {
    const data = await window.fileActions.insertAccount('facebook_table')
})

// window.seleniumActions.replyAccountData((_event, value) => {
//     const {id, status, money, proxy, newPass} = value
//     const row = document.getElementById(id)
//     const chilren = row.childNodes
//     console.log(value, chilren)
//     chilren[2].textContent = money
//     chilren[3].textContent = status
//     chilren[4].textContent = proxy
//     if(newPass)
//         chilren[1].textContent = newPass
// })

// window.fileActions.replyInsertAccount((_event, value) => {
//     const facebook_account_table = document.querySelector('.facebook_account_table tbody')
//         if(value.status == 200) {
//             try {
//                 facebook_account_table.innerHTML =  `<tr class='disabled_row'>
//                                                 <th>Tài khoản</th>
//                                                 <th>Mật khẩu</th>
//                                                 <th>2fa</th>
//                                                 <th>mail</th>
//                                                 <th>passmail</th>
//                                                 <th>cookie</th>
//                                                 <th>Trạng thái</th>
//                                                 <th>Proxy</th>
//                                             </tr>`
//                 res = value.res.trim().replace('\r', '').split('\n')
//                 let i = 0;
//                 res.forEach(account =>{
//                     const tr = document.createElement('tr')
//                     const splitAccountData = account.split('|')
//                     const usernametd = document.createElement(td)
//                     usernametd.textContent = splitAccountData[0]
//                     const passwordtd = document.createElement(td)
//                     passwordtd.textContent = splitAccountData[1]
//                     const _2fatd = document.createElement(td)
//                     _2fatd.textContent = splitAccountData[2]
//                     const mailtd = document.createElement(td)
//                     mailtd.textContent = splitAccountData[3]
//                     const passmailtd = document.createElement(td)
//                     passmailtd.textContent = splitAccountData[4]
//                     const cookietd = document.createElement(td)
//                     cookietd.textContent = splitAccountData[6]
//                     const statustd = document.createElement(td)
//                     statustd.textContent = 'Không hoạt động'

//                     // splitAccountData.forEach(item => {
//                     //     const td = document.createElement('td')
//                     //     td.textContent = item
//                     //     tr.appendChild(td)
//                     // })
//                     const proxyCol = document.createElement('td')
//                     proxyCol.textContent = 'Không dùng'
//                     tr.append(usernametd, passwordtd, _2fatd, mailtd, passmailtd, cookietd, statustd, proxyCol)
//                     selectedFunctionConstructor(tr)
//                     tr.id = `fb${i++}`
//                     facebook_account_table.appendChild(tr)
//                 })
//             }
//             //refreah table
//             catch (err){
//                 handleErrorWhileResponse(facebook_account_table, err)
//             }
//         }
//         else{
//             handleErrorWhileResponse(facebook_account_table, value.data)
//         }
//     })

//facebook program action
const facebooK_run_program = document.querySelector('.facebook_run_program')
const facebook_stop_program = document.querySelector('.facebook_stop_program')

const getFbMoreOptions = () => {
    const fboptions = {}
    fboptions['fbStartPage'] = document.querySelector('.startup_facebook_options').value
    fboptions['useDataDir'] = document.getElementById('toggle_data_dir').checked
    return fboptions
}

facebooK_run_program.addEventListener('click', () => {
    const facebookOptions = getFbMoreOptions()
    const options = getProgramSetting() 
    const sendData = getSendData(getAllFacebookSelectedAccount)
    window.seleniumActions.startAction(sendData, options, facebookOptions)

    window.seleniumActions.onReplyFacebookAccountData((_event, value) => {
        console.log(value)
        const row = document.getElementById(value.id)
        const child = row.childNodes
        switch(value.code) {
            case 500 :
                row.classList.add('warn')
                let id5 = setTimeout(() => {
                    row.classList.remove('warn')
                    clearTimeout(id5)
                }, 3000)
                break;
            case 200:
                if(value.status) {
                    child[6].textContent = value.status
                }
                if(value.proxy){
                    child[7].textContent = value.proxy
                }
                if(value.cookie){
                    child[5].textContent = value.cookie
                }
                break;
            case 202:
                row.classList.add('warn')
                setTimeout(() => {
                    row.classList.remove('warn')
                }, 3000)
                if(value.status) {
                    child[6].textContent = value.status
                }
                if(value.cookie){
                    child[5].textContent = value.cookie
                }
                if(value.proxy){
                    child[7].textContent = value.proxy
                }
                row.classList.add('warn')
                let id2 = setTimeout(() => {
                    child[6].textContent = 'Không hoạt động'
                    row.classList.remove('warn')
                    row.classList.remove('row_selected')
                    clearTimeout(id2)
                }, 3000)
                break;
            case 100:
                window.seleniumActions.offReplyFacebookAccountData()
                break;
        }
        
    })
})



shop_history_options.addEventListener('change', (e) => {
    console.log(e.target.value)
    fetch(`../history/${e.target.value}`)
    .then(data => data.json())
    .then(data => {
        console.log(data)
    })
})

document.body.querySelectorAll('table').forEach(table => {
    table.addEventListener('mousedown', (e) => {
        if(e.button == 2) {
            window.appActions.openTableMenu({x: e.x, y: e.y})
        }
    })
    window.appActions.tableSelectAll((_event, value) => {
        table.querySelectorAll('tr').forEach(row => {
            if(!row.classList.contains('row_selected')){
                row.classList.add('row_selected')
            }
        })
    })
})