const fs = require('node:fs')
const path = require('node:path')
const RequestController = require('./controller.request')
class FileController {
    static ReplaceAccountData = ({filename, username, newpass = 'not_change', money ='Chưa kiểm tra', status = 'Không hoạt động'}) => {
        let fileData = fs.readFileSync(filename, 'utf-8')
        fileData = fileData.replace('\r', '')
        let rowDatas = fileData.split('\n')
        console.log(rowDatas)
        const row = rowDatas.find((item) => {
            const usernameTxt = item.split('|')[0]
            if(username == usernameTxt)
                return item
        })
        console.log(row)
        const col = row.trim().split('|')
        console.log(col)
        col[2] = money
        col[3] = status
        if(newpass != 'not_change'){
            col[1] = newpass
        }
        const newRow = col[0] + '|' + col[1] + '|' + col[2] + '|' + col[3]
        fileData = fileData.replace(row, newRow)
        fs.writeFileSync(filename, fileData, 'utf-8')
    }

    static saveOrders = async (api_key, listOrders, configs, username) => {
        try {
            let savedHistory = FileController.readOrdersHistory('clonefb.via')
            console.log('savedHistory1-----',savedHistory)
            let savedHistoryId = [] 
            try {
                savedHistory[username]?.map(item => item?.id)
            }
            catch (err){
                console.log(err)
            }
            const filePath = path.join(__dirname, `../../history/${configs}.json`)
            listOrders = await Promise.all(listOrders.map(async(item) => {
                if(savedHistoryId.length > 0) {
                    if(!savedHistoryId.includes(item.id)) {
                        const data = await RequestController.getOrderDetails(api_key, item.id, 'https://clonefb.vn/api/v1/order')
                        item['detail'] = data
                        return item
                    }
                    else {
                        return savedHistory[username].find(data => data.id == item.id)
                    }
                }
                else {
                    const data = await RequestController.getOrderDetails(api_key, item.id, 'https://clonefb.vn/api/v1/order')
                    item['detail'] = data
                    // console.log(item)
                    return item
                }
                // console.log(item)
            }))
            console.log(listOrders)
            savedHistory[username] = listOrders
            console.log('savedHistory-------',savedHistory)
            const obj = JSON.stringify(savedHistory)
            fs.writeFileSync(filePath, obj, 'utf-8')
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
}

// console.log(FileController.readOrdersHistoryByName('quannnn', 'clonefb.via'))

module.exports = FileController