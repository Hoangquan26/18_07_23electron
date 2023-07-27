const Imap = require('node-imap')
class ImapController {
    constructor(mail, passmail) {
        const imapConfig = {
            user: mail,
            password: passmail,
            host: 'imap-mail.outlook.com',
            port: 993, // Cổng IMAP cho kết nối bảo mật
            tls: true
        }
        this.Imap = new Imap(imapConfig)
    }

    openInbox(cb) {
        this.Imap.openBox('INBOX', true, cb);
            
    }
    
    // Hàm callback xử lý khi có lỗi xảy ra trong quá trình kết nối
    onError(err) {
        console.error('Lỗi kết nối:', err);
    }

    listenFbCode = async() => {
        const imap = this.Imap
        imap.once('ready', () => {
            imap.openBox('INBOX',true,(err, box) => {
                if(err) throw err
                imap.search([['FROM', 'security@facebookmail.com']], (error, uids) => {
                    if(err) throw err
                    if(uids.length === 0) {
                        console.log('Không tìm thấy thư phù hợp.');
                        imap.end(); // Đóng kết nối nếu không tìm thấy thư phù hợp
                        return;
                    }

                    const fetch = imap.fetch(uids, {bodies: ''})
                    fetch.on('message', (message, seqno) => {
                        console.log('Email #', seqno)
                        message.on('body', (stream, info) => {
                            let buffer = ''
                            stream.on('data', (chunk) => {
                                buffer += chunk.toString()
                            })
                            stream.once('end', function () {
                                console.log('--buffer:', buffer)
                            });
                            console.log('--buffer:', buffer)
                        })
                    })
                    fetch.once('end', function () {
                        // Đóng kết nối sau khi đã đọc thư
                        imap.end()
                    });
                })
            })
        })
    
        imap.connect()
        imap.on('error', this.onError)
    }
}

const newMail = new ImapController('dozalshikeh@hotmail.com', 'tYDBzy12')
newMail.listenFbCode()
.then(data => {
    console.log(data)
})

