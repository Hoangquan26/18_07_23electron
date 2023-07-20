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

// end handle toogle body_config

// handle ui proxy session

const radioProxies = document.querySelectorAll("input[type='radio'][name='proxy_type']")
const proxyPaths = document.querySelectorAll("input[type='text'][name='proxy_path']")
radioProxies[0].addEventListener('click', (e) => {
    proxyPaths[1].disabled = true
    proxyPaths[0].disabled = false
    proxyPaths[1].value = ''
})
radioProxies[1].addEventListener('click', (e) => {
    proxyPaths[1].disabled = false
    proxyPaths[0].disabled = true
    proxyPaths[0].value = ''
})

//define user ui: select account
const account_table_rows = document.querySelectorAll('.account_table tr')

const selectedRow = (item) => {
    item.classList.toggle('row_selected')
}

const selectedFunctionConstructor = (element) => {
    if(!element.classList.contains('disabled_row')) {
        element.addEventListener('click', () => {
            selectedRow(element)
        })
    }
}

account_table_rows.forEach(element => {
    selectedFunctionConstructor(element)
})

const getAllSelectedAccount = () => {
    return document.querySelectorAll('.row_selected')
}


//handle input ui

const delay_start_input = document.getElementsByName('delay_start')[0]
const delay_end_input = document.getElementsByName('delay_end')[0]
delay_start_input.addEventListener('change', (e) => {
    console.log(delay_end_input.value)
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

const handleErrorWhileResponse = (account_table, err) => {
    account_table.innerHTML =  `<tr class='disabled_row'>
                                    <th>Tài khoản</th>
                                    <th>Mật khẩu</th>
                                    <th>Số dư</th>
                                    <th>Trạng thái</th>
                                </tr>
                                <tr class='disabled_row'>
                                    <td colspan="4" aria-colspan="4">
                                        <div class="none_account_image_wrapper">
                                            <img class="none_account_image" src="./assets/images/ErrorInserUser.png"/>
                                            <h3>Chưa có tài khoản</h3>
                                        </div>
                                    </td>
                                </tr>
                                        `
}

const fileSelector = document.getElementsByName('account_selection')[0]

fileSelector.addEventListener('click', async () => {
    const data = await window.fileActions.insertAccount()
})

window.seleniumActions.replyAccountData((_event, value) => {
    console.log(value)
    const {id, status, money, proxy, newPass} = value
    const row = document.getElementById(id)
    const chilren = row.childNodes
    console.log(value, chilren)
    chilren[2].textContent = money
    chilren[3].textContent = status
    chilren[4].textContent = proxy
    if(newPass)
        chilren[1].textContent = newPass
})

window.fileActions.replyInsertAccount((_event, value) => {
    const account_table = document.querySelector('.account_table')
        if(value.status == 200) {
            try {
                account_table.innerHTML =  `<tr class='disabled_row'>
                                                <th>Tài khoản</th>
                                                <th>Mật khẩu</th>
                                                <th>Số dư</th>
                                                <th>Trạng thái</th>
                                                <th>Proxy</th>
                                            </tr>`
                res = value.res.trim().replace('\r', '').split('\n')
                let i = 0;
                res.forEach(account =>{
                    const tr = document.createElement('tr')
                    const splitAccountData = account.split('|')
                    splitAccountData.forEach(item => {
                        const td = document.createElement('td')
                        td.textContent = item
                        tr.appendChild(td)
                    })
                    const proxyCol = document.createElement('td')
                    proxyCol.textContent = 'Không dùng'
                    tr.append(proxyCol)
                    selectedFunctionConstructor(tr)
                    tr.id = i++
                    account_table.appendChild(tr)
                })
            }
            //refreah table
            catch (err){
                handleErrorWhileResponse(account_table, err)
            }
        }
        else{
            handleErrorWhileResponse(account_table, value.data)
        }
    })

//program action
const run_program = document.querySelector('.run_program')


const getProgramSetting = () => {
    const options = {}
    options['path'] = document.getElementsByName('web_path')[0].value
    const proxy_chance = document.getElementsByName('proxy_type')
    if(proxy_chance[0].checked){
        options['autoProxy'] = document.getElementsByName('proxy_path')[0].value
    }
    else {
        options['normalProxy'] = document.getElementsByName('proxy_path')[1].value
    }
    options['startDelay'] = parseInt(document.getElementsByName('delay_start')[0].value)
    options['endDelay'] = parseInt(document.getElementsByName('delay_end')[0].value)
    options['totalThread'] = parseInt(document.getElementsByName('total_thread')[0].value)
    const new_pass = document.getElementsByName('new_pass')[0].value
    if(new_pass)
        options['changePassword'] = true
        options['newPass'] = new_pass
    return options
}

run_program.addEventListener('click', () => {
    //get option
    const options = getProgramSetting()
    //get accounts
    const rowData = getAllSelectedAccount()
    const sendData = []
    rowData.forEach((data) => {
        child = data.childNodes
        const id = data.id
        const username = child[0].textContent
        const password = child[1].textContent
        sendData.push({id, username, password})
        if(child[3].textContent === 'Không hoạt động') {
            try {
                child[3].textContent === 'Đang hoạt động'
                // window.seleniumActions.startAction([{id: data.getAttribute('id').toString() ,username: child[0].textContent, password: child[1].textContent}])
                child[3].style.color == 'green'
                child[3].textContent === 'Thành công'
            }
            catch {
                child[3].style.color == 'red'
                child[3].textContent === 'Lỗi'
            }
            finally{
                setTimeout(() => {
                    child[3].style.color == 'black'
                    child[3].textContent === 'Không hoạt động'
                }, 3000)
            }
        }
    })
    //start task
    window.seleniumActions.startAction(sendData, options)
    // window.seleniumActions.startAction([{username: 'quannnn', password: '642003'}])
})

