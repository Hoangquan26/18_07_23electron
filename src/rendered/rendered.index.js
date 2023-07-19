const body_config_close_btn = document.querySelector(".body_config--action")
body_config_close_btn.addEventListener('click', () => {
    const body_config = document.querySelector('.body_config')
    const blur = document.querySelector('.blur')
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
    const {id, status, money} = value
    const row = document.getElementById(id)
    console.log(row)
    const chilren = row.childNodes
    chilren[2].textContent = money
    chilren[3].textContent = status
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
    run_program.addEventListener('click', () => {
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
        window.seleniumActions.startAction(sendData)
        // window.seleniumActions.startAction([{username: 'quannnn', password: '642003'}])
    })