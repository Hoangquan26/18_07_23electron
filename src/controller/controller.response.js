class ResponseController {
    static replyAccountData = async ({id, money, status}, sender) => {
        console.log('Gửi tin nhắn')
        sender.send('selenium:replyAccountData', {
            id, money, status
        })
    }
}

module.exports = ResponseController