const fs = require('node:fs')
class FileController {
    static ReplaceAccountData = ({filename, username, newpass = 'not_change', money ='Chưa kiểm tra', status = 'Không hoạt động'}) => {
        let fileData = fs.readFileSync(filename, 'utf-8')
        fileData = fileData.replace('\r', '')
        let rowDatas = fileData.split('\n')
        // rowDatas.forEach(row => {
        //     const col = row.split('|')
        //     if(col[0] == username){
        //         col[2] = money
        //         col[3] = status
        //         if(newpass != 'not_change'){
        //             col[1] = newpass
        //         }
        //         row = '\n' + col[0] + '|' + col[1] + '|' + col[2] + '|' + col[3] + '\n'
        //     }
        //     newTextData += row
        // })
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
}

module.exports = FileController