class ResponseController {
    static replyAccountData = async ({id, money = 'Chưa kiểm tra', status, proxy = 'Không dùng', newPass = null}, sender) => {
        console.log('Gửi tin nhắn')
        sender.send('selenium:replyAccountData', {
            id, money, status, proxy, newPass
        })
    }
}

module.exports = ResponseController