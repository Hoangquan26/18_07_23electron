class ResponseController {
    static replyAccountData = async ({code = 200,id, money = 'Chưa kiểm tra', status, proxy = 'Không dùng', newPass = null, savedHistory = false}, sender) => {
        sender.send('selenium:replyAccountData', {
            id, money, status, proxy, newPass, savedHistory, code
        })
    }
    static replyFacebookAccountData = async({id, password=  null, cookie= null, passmail= null, status= null, proxy= null, code= 200}, sender) => {     
        sender.send('selenium:replyFacebookAccountData', {
            id, passmail, password, status, proxy, code, cookie
        })
    }

}


module.exports = ResponseController