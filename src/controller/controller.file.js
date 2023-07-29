const fs = require('node:fs')
const path = require('node:path')
const RequestController = require('./controller.request')
class FileController {
    static ReplaceAccountData = ({filename, username, newpass = 'not_change', money ='Chưa kiểm tra', status = 'Không hoạt động'}) => {
        let fileData = fs.readFileSync(filename, 'utf-8')
        fileData = fileData.replace('\r', '')
        let rowDatas = fileData.split('\n')
        const row = rowDatas.find((item) => {
            const usernameTxt = item.split('|')[0]
            if(username == usernameTxt)
                return item
        })
        const col = row.trim().split('|')
        col[2] = money
        col[3] = status
        if(newpass != 'not_change'){
            col[1] = newpass
        }
        const newRow = col[0] + '|' + col[1] + '|' + col[2] + '|' + col[3]
        fileData = fileData.replace(row, newRow)
        fs.writeFileSync(filename, fileData, 'utf-8')
    }

    static ReplaceFacebookAccountData = ({filename, username, newpass = 'not_change', cookie = null}) => {
        let fileData = fs.readFileSync(filename, 'utf-8')
        fileData = fileData.replace('\r', '')
        let rowDatas = fileData.split('\n')
        const row = rowDatas.find((item) => {
            const usernameTxt = item.split('|')[0]
            if(username == usernameTxt)
                return item
        })
        const col = row.trim().split('|')
        if(cookie) {
            col[6] = cookie
        }
        if(newpass != 'not_change'){
            col[1] = newpass
        }
        const newRow = col[0] + '|' + col[1] + '|' + col[2] + '|' + col[3] + '|' + col[4] + '|' + col[5] + '|' + col[6] + '|' + col[7]
        fileData = fileData.replace(row, newRow)
        fs.writeFileSync(filename, fileData, 'utf-8')
    }

    static saveOrdersVer3 = async (api_key, listOrders, configs, username, api)  => {
        try {
            let savedHistory = FileController.readOrderHistoryVer3(configs, username)
            const folderPath = path.join(__dirname, `../../history/${configs}`)
            const filePath = path.join(__dirname, `../../history/${configs}/${username}.txt`)
            if(listOrders?.length > 0)
            {
                listOrders = listOrders.map((item) => {
                    if(savedHistory?.length > 0) {
                        if(!savedHistory?.includes(item.id)) {
                            // const data = await RequestController.getOrderDetails(api_key, item.id, api)
                            // item['detail'] = data
                            return item.id
                        }
                        else {
                            return savedHistory.find(data => data.id == item.id)
                        }
                    }
                    else {
                        // const data = await RequestController.getOrderDetails(api_key, item.id, api)
                        // item['detail'] = data
                        // console.log(item)
                        return item.id
                    }
                    // console.log(item)
                })
                savedHistory = listOrders
            }
            const obj = savedHistory?.join('\n')
            console.log('savedHistory-------',obj)
            try {
                fs.writeFileSync(filePath, obj, 'utf-8')
            }
            catch {
                fs.mkdirSync(folderPath)
                fs.writeFileSync(filePath, obj, 'utf-8')
            }
        }
        catch(err) {
            console.log(err)
        }
    }

    static readOrderHistoryVer3 =  (config, username) => {
        try {
            const filePath = path.join(__dirname, `../../history/${config}/${username}.txt`)
            const data = fs.readFileSync(filePath, 'utf-8')
            return data.split('\n')
        }
        catch {
            return []
        }
    }

    static saveOrdersVer2 = async (api_key, listOrders, configs, username, api)  => {
        try {
            let savedHistory = FileController.readOrderHistoryVer2(configs, username)
            console.log('savedHistory1-----',savedHistory)
            let savedHistoryId = [] 
            try {
                savedHistoryId = savedHistory[username]?.map(item => item?.id)
            }
            catch (err){
                console.log(err)
            }
            const folderPath = path.join(__dirname, `../../history/${configs}`)
            const filePath = path.join(__dirname, `../../history/${configs}/${username}.json`)
            if(listOrders.length > 0)
            {
                listOrders = await Promise.all(listOrders.map(async(item) => {
                    if(savedHistory?.length > 0) {
                        if(!savedHistoryId?.includes(item.id)) {
                            const data = await RequestController.getOrderDetails(api_key, item.id, api)
                            item['detail'] = data
                            return item
                        }
                        else {
                            return savedHistory[username].find(data => data.id == item.id)
                        }
                    }
                    else {
                        const data = await RequestController.getOrderDetails(api_key, item.id, api)
                        item['detail'] = data
                        // console.log(item)
                        return item
                    }
                    // console.log(item)
                }))
                savedHistory[username] = listOrders
            }
            console.log('savedHistory-------',savedHistory)
            const obj = JSON.stringify(savedHistory)
            try {
                fs.writeFileSync(filePath, obj, 'utf-8')
            }
            catch {
                fs.mkdirSync(folderPath)
                fs.writeFileSync(filePath, obj, 'utf-8')
            }
        }
        catch(err) {
            console.log(err)
        }
    }

    static saveOrders = async (api_key, listOrders, configs, username, api) => {
        try {
            let savedHistory = FileController.readOrdersHistory(configs)
            console.log('savedHistory1-----',savedHistory)
            let savedHistoryId = [] 
            try {
                savedHistoryId = savedHistory[username]?.map(item => item?.id)
            }
            catch (err){
                console.log(err)
            }
            const filePath = path.join(__dirname, `../../history/${configs}.json`)
            if(listOrders.length > 0)
            {
                listOrders = await Promise.all(listOrders.map(async(item) => {
                    if(savedHistoryId?.length > 0) {
                        if(!savedHistoryId?.includes(item.id)) {
                            const data = await RequestController.getOrderDetails(api_key, item.id, api)
                            item['detail'] = data
                            return item
                        }
                        else {
                            return savedHistory[username].find(data => data.id == item.id)
                        }
                    }
                    else {
                        const data = await RequestController.getOrderDetails(api_key, item.id, api)
                        item['detail'] = data
                        // console.log(item)
                        return item
                    }
                    // console.log(item)
                }))
                savedHistory[username] = listOrders
            }
            console.log('savedHistory-------',savedHistory)
            const obj = JSON.stringify(savedHistory)
            try {
                fs.writeFileSync(filePath, obj, 'utf-8')
            }
            catch {
                fs.mkdirSync(filePath.replace(`\\${username}.json`, ''))
                fs.writeFileSync(filePath, obj, 'utf-8')
            }
        }
        catch(err) {
            console.log(err)
        }
    }

    static readOrdersHistory = (configs) => {
        try {
            const filePath = path.join(__dirname, `../../history/${configs}.json`)
            const data = fs.readFileSync(filePath, 'utf-8')
            return JSON.parse(data)
        }
        catch {
            return {}
        }
    }

    static readOrderHistoryVer2 = (config, username) => {
        try {
            const filePath = path.join(__dirname, `../../history/${config}/${username}.json`)
            const data = fs.readFileSync(filePath, 'utf-8')
            console.log('======data',data)
            return JSON.parse(data)
        }
        catch {
            return {}
        }
    }
}

// console.log(FileController.saveOrders('1aefc10d73dbddb009f281bc8cf8a14d',[], 'clonefb.via' ,'quannnn'))

module.exports = FileController