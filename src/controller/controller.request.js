const fs = require('node:fs')
class RequestController {
    static getApiKey = async (x_csrf_token, cookie) =>  {        
        return await fetch('https://clonefb.vn/updateAPIKEY', {
            method: 'POST',
            headers :{
                "X-Csrf-Token" : x_csrf_token,
                "Cookie" : cookie
            }
        })
        .then(data => 
            {
            return data.json()
            })
        .then(data => {
            if(data.status == true)
                return data.api_key
            return 'NOT_FOUND'
        })
    }
    
    //https://clonefb.vn/api/v1/orders
    static getListOrder = async (api_key, path) => {
        const res = await fetch(path, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              'api_key': api_key
            })
        })
        .then(data => {
            // fs.writeFileSync('./page.html', data.body., 'utf-8')
            return data.json()
        })
        .then(data => {   
            if(data?.links?.next) {
                return [...data.data,
                        ...getListOrder(api_key, data.links.next)]
            }
            else {
                return data.data
            }
            return data
        })
        return res
    }

    static getListOrders = async (api_key, path) => {
        console.log(api_key)
        const res = await RequestController.getListOrder(api_key, path)
        return res
    }

    static getOrderDetails = async(api_key, order_id, path) => {
        const res = await new Promise((resolve, reject) => {
            fetch(path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "api_key" : api_key,
                    "order_id": order_id
                })
            })
            .then(data => resolve(data.json()))
        }) 
        return res
    }
}

// RequestController.getListOrders('5ae3f3e6edae396f5838477c24c8c4cf', 'https://clonefb.vn/api/v1/orders')
// .then(data => {
//     console.log(data)
// })
// RequestController.getOrderDetails('dc757987cd6057b2e231a963fb4675d7', 121559 ,'https://clonefb.vn/api/v1/order')
// .then(data => {
//     console.log(data)
// })

// RequestController.getApiKey('xtcx2WnH8LUsABBMwhyGobrZdYCUqFHH9bBuNiYg')
// .then(data => console.log(data))
module.exports = RequestController