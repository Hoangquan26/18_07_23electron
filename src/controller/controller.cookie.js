class CookieController {
    static convertJsonCookieToText = (cookies) => {
        let str_cookie = ''
        cookies.forEach(cookie => {
            str_cookie += cookie['name']
            str_cookie += '='
            str_cookie += cookie['value']
            str_cookie += '; '
        })
        return str_cookie
    }

    static convertTextCookieToList = (str_cookies) => {
        const array = []
        str_cookies = str_cookies.replace(' ', '')
        console.log(str_cookies)
        const cookie = str_cookies.split(';')
        cookie.forEach(item => {
            item = item.split('=')
            array.push({
                name: item[0].trim(),
                value: item[1]
            })
        })
        //last element was ;nothing
        array.pop()
        return array
    }
}

// console.log(CookieController.convertTextCookieToList(CookieController.convertJsonCookieToText([
//     {
//       domain: '.facebook.com',
//       expiry: 1697941545,
//       httpOnly: true,
//       name: 'm_page_voice',
//       path: '/',
//       sameSite: 'None',
//       secure: true,
//       value: '100063492786994'
//     },
//     {
//       domain: '.facebook.com',
//       expiry: 1697941540,
//       httpOnly: true,
//       name: 'fr',
//       path: '/',
//       sameSite: 'None',
//       secure: true,
//       value: '0naMuwuXN2uFGtWeg.AWXYaas0eYaP2k8MLmOS-_KiKvE.BkveEc.21.AAA.0.0.BkveEc.AWXN7IZhJr0'
//     },
//     {
//       domain: '.facebook.com',
//       expiry: 1721701537,
//       httpOnly: true,
//       name: 'xs',
//       path: '/',
//       sameSite: 'None',
//       secure: true,
//       value: '20%3Ad3Xl52DA26KUdw%3A2%3A1690165533%3A-1%3A7601'
//     },
//     {
//       domain: '.facebook.com',
//       expiry: 1721701537,
//       httpOnly: false,
//       name: 'c_user',
//       path: '/',
//       sameSite: 'None',
//       secure: true,
//       value: '100063492786994'
//     },
//     {
//       domain: '.facebook.com',
//       expiry: 1690770316,
//       httpOnly: false,
//       name: 'locale',
//       path: '/',
//       sameSite: 'None',
//       secure: true,
//       value: 'en_GB'
//     },
//     {
//       domain: '.facebook.com',
//       expiry: 1724725540,
//       httpOnly: true,
//       name: 'sb',
//       path: '/',
//       sameSite: 'None',
//       secure: true,
//       value: 'A-G9ZBqzCcx0Sk-zdF4YfMxV'
//     },
//     {
//       domain: '.facebook.com',
//       expiry: 1724725509,
//       httpOnly: true,
//       name: 'datr',
//       path: '/',
//       sameSite: 'None',
//       secure: true,
//       value: 'A-G9ZBsjibcoV6kI44PW700e'
//     }
//   ])))

module.exports = CookieController