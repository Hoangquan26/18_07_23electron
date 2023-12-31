const path = require('node:path')
const fs = require('node:fs')
const {dialog} = require('electron')
const getSavePath = async (event) => {
    const savePath = await dialog.showSaveDialog( {
        filters: [{ name: "Json", extensions: ['json'] }] 
})
    event.sender.send('setting:replySavePath', savePath)
}

const saveConfig = (event, data) => {
    const savePath = data.savePath
    const filePath = path.join(__dirname, '../../configs/index.json')
    const configElement = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const listConfig = configElement.listConfig
    const savePathName =path.basename(savePath)
    const match = listConfig.find(item => item.name == savePathName)
    console.log(match)
    if(!match){
        configElement.listConfig.push({
            name: savePathName,
            select: false
        })
    }

    fs.writeFileSync(filePath,  JSON.stringify(configElement), 'utf-8')


    data = data.data
    const string = JSON.stringify(data)
    fs.writeFileSync(savePath, string, 'utf-8')
}

const changeSelectedSetting = (event, data) => {
    const filePath = path.join(__dirname, '../../configs/index.json')
    const string = fs.readFileSync(filePath, 'utf-8')
    json = JSON.parse(string)
    json = json.listConfig
    json.forEach(item => {
        if(item.name != data) {
            item.selected = false
        }
        else {
            item.selected = true
        }
    })
    fs.writeFileSync(filePath, JSON.stringify({
        "listConfig" : json
    }))
}

const getIndexCurrentSetting = () => {
    const filePath = path.join(__dirname, '../../configs/index.json')
    const string = fs.readFileSync(filePath, 'utf-8')
    json = JSON.parse(string)
    json = json.listConfig
    return json.find(item => item.selected == true)
}

const getCurrentSetting = (file) => {
    const filePath = path.join(__dirname, `../../configs/${file}`)
    const string = fs.readFileSync(filePath, 'utf-8')
    json = JSON.parse(string)
    return json
}

module.exports = {
    getSavePath,
    saveConfig,
    changeSelectedSetting,
    getCurrentSetting,
    getIndexCurrentSetting
}