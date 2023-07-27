const listConfigs = []
const selectConfigElement = document.querySelector(".config_selector")
let currentConfig = ''
//setup data 
const setDataSetting = (path) => {
    console.log(path)
    fetch(`../../../configs/${path}`)
    .then(data => data.json())
    .then(data => {
        console.log(data)
        document.querySelector("input[name='login_web_path_location']").value = data.login_web_path_location?.location ?? ''
        document.querySelector("input[name='username_input_location']").value = data.username_input_location?.location ?? ''
        document.querySelector("select[name='username_input_type']").value = data.username_input_location?.type ?? ''
        document.querySelector("input[name='password_input_location']").value = data.password_input_location?.location ?? ''
        document.querySelector("select[name='password_input_type']").value = data.password_input_location?.type ?? ''
        document.querySelector("input[name='login_button_location']").value = data.login_button_location?.location ?? ''
        document.querySelector("select[name='login_button_type']").value = data.login_button_location?.type ?? ''
        document.querySelector("input[name='account_web_path_location']").value = data.account_web_path_location?.location ?? ''

        document.querySelector("input[name='submit_password_input_location']").value = data.submit_password_input_location?.location ?? ''
        document.querySelector("select[name='submit_password_input_type']").value =data.submit_password_input_location?.type ?? ''

        document.querySelector("input[name='balance_location']").value = data.balance_location?.location ?? ''
        document.querySelector("select[name='balance_type']").value = data.balance_location?.type ?? ''
        document.querySelector("input[name='repass_input_location']").value = data.repass_input_location?.location ?? ''
        document.querySelector("select[name='repass_input_type']").value = data.repass_input_location?.type ?? ''
        document.querySelector("input[name='newpass_input_location']").value = data.newpass_input_location?.location ?? ''
        document.querySelector("select[name='newpass_input_type']").value = data.newpass_input_location?.type ?? ''
        document.querySelector("input[name='confirm_password_input_location']").value = data.confirm_password_input_location?.location ?? ''
        document.querySelector("select[name='confirm_password_input_type']").value = data.confirm_password_input_location?.type ?? ''
        document.querySelector("input[name='history_web_path_location']").value = data.history_web_path_location?.location ?? ''
        document.querySelector("input[name='history_table_location']").value = data.history_table_location?.location ?? ''
        document.querySelector("select[name='history_table_type']").value = data.history_table_type?.type ?? ''
        
        document.querySelector("input[name='notify_location']").value = data.notify_location?.location ?? ''
        document.querySelector("select[name='notify_type']").value = data.notify_location?.type ?? ''

        document.querySelector("input[name='API_get_key']").value = data?.api?.api_key ?? ''

        document.querySelector("input[name='API_get_list_orders']").value = data?.api?.list_order ?? '';

        document.querySelector("input[name='API_get_order_detail']").value = data?.api?.order_detail ?? ''
        
    })
}
selectConfigElement.addEventListener('change', e => {
    console.log(e.target.value)
    window.settingAction.changeSelectedSetting(e.target.value)
    setDataSetting(e.target.value)
})

fetch('../../../configs/index.json')
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
        selectConfigElement.append(options)
    })
    selectConfigElement.value = currentConfig
    return currentConfig
})
.then(path =>{
    setDataSetting(path)
})


//save config options

const createListenerSaveSettingPath = async (element) => {
    window.settingAction.replySavePath((_event, value) => {
        const { canceled, filePath } = value
        if(!canceled) {
            element.value = filePath
        }
    })
}
const inputSaveSettingPath = document.querySelector("input[name='save_history_path_location']")
inputSaveSettingPath.addEventListener('click', () => {
    window.settingAction.getSavePath()
    createListenerSaveSettingPath(inputSaveSettingPath)
    .then(() =>{
        new AbortController().abort(window.settingAction.replySavePath)
    })
})

inputSaveSettingPath.addEventListener('keydown', (e) =>{
    e.preventDefault()
})

//handle add cconfig 
const showAddConfigBtn = document.querySelector('.add_config')
const saveBtnWrapper = document.querySelector('.setting_action_wrapper')
showAddConfigBtn.addEventListener('click', () => {
    showAddConfigBtn.textContent == 'Thêm cấu hình' ? saveBtnWrapper.classList.remove('none') : saveBtnWrapper.classList.add('none')
    showAddConfigBtn.textContent = showAddConfigBtn.textContent == 'Thêm cấu hình' ? 'Hủy' : 'Thêm cấu hình'
})


const getMainSettingData = () => {
    const configObj = {}
    configObj['login_web_path_location'] = {}
    configObj['login_web_path_location']['location'] = document.querySelector("input[name='login_web_path_location']").value ?? ''
    configObj['login_web_path_location']['type'] = 'webPath'
    configObj['username_input_location'] = {}
    configObj['username_input_location']['location'] = document.querySelector("input[name='username_input_location']").value ?? ''
    configObj['username_input_location']['type'] = document.querySelector("select[name='username_input_type']").value ?? ''
    configObj['password_input_location'] = {}
    configObj['password_input_location']['location']  = document.querySelector("input[name='password_input_location']").value ?? ''
    configObj['password_input_location']['type']  = document.querySelector("select[name='password_input_type']").value ?? ''
    configObj['login_button_location'] = {}
    configObj['login_button_location']['location']  = document.querySelector("input[name='login_button_location']").value ?? ''
    configObj['login_button_location']['type']  = document.querySelector("select[name='login_button_type']").value ?? ''
    configObj['account_web_path_location'] = {}
    configObj['account_web_path_location']['location']  = document.querySelector("input[name='account_web_path_location']").value ?? ''
    configObj['account_web_path_location']['type']  = 'webPath'
    configObj['balance_location'] = {}
    configObj['balance_location']['location'] = document.querySelector("input[name='balance_location']").value ?? ''
    configObj['balance_location']['type'] = document.querySelector("select[name='balance_type']").value ?? ''
    configObj['repass_input_location'] = {}
    configObj['repass_input_location']['location'] = document.querySelector("input[name='repass_input_location']").value ?? ''
    configObj['repass_input_location']['type'] = document.querySelector("select[name='repass_input_type']").value ?? ''
    configObj['newpass_input_location'] = {}
    configObj['newpass_input_location']['location'] = document.querySelector("input[name='newpass_input_location']").value ?? ''
    configObj['newpass_input_location']['type'] = document.querySelector("select[name='newpass_input_type']").value ?? ''
    configObj['confirm_password_input_location'] = {}
    configObj['confirm_password_input_location']['location'] = document.querySelector("input[name='confirm_password_input_location']").value ?? ''
    configObj['confirm_password_input_location']['type'] = document.querySelector("select[name='confirm_password_input_type']").value ?? ''
    configObj['history_web_path_location'] = {}
    configObj['history_web_path_location']['location']  = document.querySelector("input[name='history_web_path_location']").value ?? ''
    configObj['history_web_path_location']['type']  = 'webPath'
    configObj['submit_password_input_location'] = {}
    configObj['submit_password_input_location']['location'] = document.querySelector("input[name='submit_password_input_location']").value ?? ''
    configObj['submit_password_input_location']['type'] = document.querySelector("select[name='submit_password_input_type']").value ?? ''
    configObj['history_table_location'] = {}
    configObj['history_table_location']['location']  = document.querySelector("input[name='history_table_location']").value ?? ''
    configObj['history_table_location']['type']  = document.querySelector("select[name='history_table_type']").value ?? ''

    configObj['notify_location'] = {}
    configObj['notify_location']['location']  = document.querySelector("input[name='notify_location']").value ?? ''
    configObj['notify_location']['type']  = document.querySelector("select[name='notify_type']").value ?? ''




    //api se
    configObj['api'] = {}
    configObj['api']['api_key'] = document.querySelector("input[name='API_get_key']").value
    configObj['api']['list_order'] = document.querySelector("input[name='API_get_list_orders']").value
    configObj['api']['order_detail'] = document.querySelector("input[name='API_get_order_detail']").value
    for(let item of Object.values(configObj)) {
        if(!item) {
            alert("Chưa nhập đủ các trường dữ liệu")
            return null
            break;
        }
    }
    const savePath = document.querySelector("input[name='save_history_path_location']").value
    if(!savePath || !savePath.includes(".json"))
    {
        alert("Chưa chọn vị trí lưu cài dặt")
        return null
    }
    return {
        "savePath" : savePath,
        "data" : configObj
    }
}

saveBtnWrapper.addEventListener('click', (e) => {
    const data = getMainSettingData()
    console.log(data)
    if(!data) {
        e.preventDefault()
    }
    window.settingAction.saveSetting(data)
})

// navbar
const tabSelector = {
    api_selector: '.apiSetting',
    main_selector: '.shopViaSetting',
    fb_selector: '.facebookSetting'
}
const api_selector = document.querySelector('.api_selector')
api_selector.addEventListener('click', () => {
    document.querySelector('.onScreen').classList.remove('onScreen')
    document.querySelector(tabSelector.api_selector).classList.add('onScreen')
})

const main_selector = document.querySelector('.main_selector')
main_selector.addEventListener('click', () => {
    document.querySelector('.onScreen').classList.remove('onScreen')
    document.querySelector(tabSelector.main_selector).classList.add('onScreen')
})

const fb_selector = document.querySelector('.fb_selector')
fb_selector.addEventListener('click', () => {
    document.querySelector('.onScreen').classList.remove('onScreen')
    document.querySelector(tabSelector.fb_selector).classList.add('onScreen')
})