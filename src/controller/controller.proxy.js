class ProxyController {
    static autoGetListProxy = async (proxyPath, page) => {
        proxyPath = `http://192.168.1.7:22022/v2/eth_get_proxy_list?page=${page}&limit=20&sort=%2Bid`
        const res = await fetch(proxyPath)
        .then(data => data.json())
        .then(data => {
            data = data.data
            return data.map(proxy => {
                return `${proxy.system}:${proxy.proxy_port}`
            })
        })
        return res
    }
}


module.exports = ProxyController