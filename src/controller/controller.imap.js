const Imap = require('imap')
class ImapController {
    constructor(mail, passmail) {
        this.mail = mail
        this.passmail = passmail
    }

    openInbox(cb) {
        this.Imap.openBox('INBOX', true, cb);     
    }

    static readMail = async() => {
        const imapConfig = {
            user: this.mail,
            password: this.passmail,
            host: 'imap-mail.outlook.com',
            port: 993, // Cổng IMAP cho kết nối bảo mật
            tls: true
        }
        const imap = new Imap(imapConfig)
        imap.once('ready', () => {
            imap.openBox('INBOX', true, (error, mailbox) => {
                if(err) throw err
                
            })
        })
    }
    
}

const newMail = new ImapController('dozalshikeh@hotmail.com', 'tYDBzy12')
newMail.listenFbCode()
.then(data => {
    console.log(data)
})

