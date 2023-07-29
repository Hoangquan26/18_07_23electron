
const setupDataV1 = async(username, fileName) => {
    return await fetch(`../../../history/${fileName}.via.json`)
    .then(data => {
        try {
            const res = data.json()
            return res
        }
        catch {
            return {}
        }
    })
    .then(data => {
        return data[username]
    })
}


const setupData = async(username, fileName) => {
    return await fetch(`../../../history/${fileName}.via/${username}.json`)
    .then(data => {
        try {
            const res = data.json()
            return res
        }
        catch {
            return {}
        }
    })
    .then(data => {
        return Object.values(data)
    })
}


let listOrders
const togglePage = () => {
    document.querySelector('.detail_content').classList.toggle('onScreen')
    document.querySelector('.content').classList.toggle('onScreen')
}

const copyToClipboard = (item) => {
    console.log('click  ')
    const text =item.getAttribute('data-clipboard-text')
    navigator.clipboard.writeText(text)
}


const openDetail = (id) => {
    const order = listOrders[0].find(item => item.id === id).detail
    console.log(order)
    const header = document.querySelector('.rows')
    header.innerHTML = `<div class="col-md-6 col-sm-12">
                            <div class="row mb-4">
                                <div class="col-3 text-right">Mã đơn :</div>
                                <div class="col-9">
                                    <a class="btn-copy text-black link-fx font-weight-bold" data-clipboard-text="${order.id}">${order.id}</a>
                                </div>
                            </div>
                            <div class="row mb-4">
                                <div class="col-3 text-right">Thể loại:</div>
                                <div class="col-9 font-weight-bold">${order.type}</div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-3 text-right">Thời gian :</div>
                                <div class="col-9 font-weight-bold">${new Date(order.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                        <div class="col-md-6 col-sm-12">
                            <div class="row mb-4">
                                <div class="col-3 text-right">Số lượng :</div>
                                <div class="col-9 font-weight-bold">${order.quantity}</div>
                            </div>
                            <div class="row mb-4">
                                <div class="col-3 text-right">Tổng tiền :</div>
                                <div class="col-9 font-weight-bold">${order.total_price} VNĐ</div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-3 text-right">Trạng thái :</div>
                                <div class="col-9 font-weight-bold">
                                    <span class="text-success">Hoàn thành</span>
                                </div>
                            </div>
                        </div>`

    const table = document.querySelector('.detail_table.table-bordered.table-striped.table-vcenter tbody')
    table.innerHTML = ''
    table.querySelectorAll('a.btn-copy')?.forEach(item => {
        item.removeEventListener('click', () => {
        copyToClipboard(item)}
        )
    })

    order.data.forEach(item => {
        const tr = document.createElement('tr')
        tr.innerHTML = `<tr>
                            <td class="d-sm-table-cell text-center" >
                                <a class="btn-copy text-body-color link-fx" data-clipboard-text="${item.uid}">${item.uid}</a>
                            </td>
                            <td class="d-sm-table-cell text-center" >
                                <span class=" width_300 text-truncate d-block" >
                                    <a class="btn-copy text-body-color" data-clipboard-text="${item.full_info}">${item.full_info}</a>
                                </span>
                            </td>
                            
                            <td class="d-sm-table-cell text-center icon-wrapper" >
                                <a data-toggle="tooltip" data-placement="top" title="" class="js-tooltip-enabled" data-original-title="Tải về phôi via">
                                    <i class='bx bx-download'></i>
                                </a>
                            </td>
                            <td class="icon-wrapper">
                                <a class="btn btn-outline-primary btn-copy js-click-ripple-enabled" data-clipboard-text="${item.full_info}"><i class='bx bx-copy-alt'></i></a>
                            </td>     
                        </tr>`
        tr.querySelectorAll('a.btn-copy').forEach(item => {
            item.addEventListener('click',() => {
                copyToClipboard(item)
            })
        })
        table.append(tr)
    })
}

document.querySelector('.back_to_main').addEventListener('click', (e) => {
    togglePage()
})
window.windows.setupData(async(_event, value) => {
    const {username, fileName} = value
    listOrders = await setupData(username, fileName)
    const table = document.querySelector('table.table')
    table.innerHTML = `<tr>
                            <th>Mã đơn</th>
                            <th>Thời gian</th>
                            <th>Thể loại</th>
                            <th>Số lượng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th><i class="far fa-question-circle"></i></th>
                        </tr>`
    listOrders[0].forEach(order => {
        const tr = document.createElement('tr')
        tr.innerHTML = `<td><a class="" href="https://clonefb.vn/don-hang/${order.id}">#${order.id}</a></td>
                        <td>
                            ${new Date(order.created_at).toLocaleString()}
                        </td>
                        <td>
                            <span class="label label-info"><em class="font-size-sm text-muted">${order.type}</em></span>
                        </td>
                        <td>${order.quantity}</td>
                        <td>${order.total_price}</td>
                        <td class="d-sm-table-cell text-center" >
                            <span class="badge badge-success">Hoàn thành</span>
                        </td>
                        <td class="d-sm-table-cell text-center">
                            <div class="btn-group" role="group">
                                
                            </div>
                        </td>`

        const btn_group = tr.querySelector('.btn-group')
        let a = document.createElement('a')
        a.classList.add('btn','btn-outline-danger','js-click-ripple-enabled','js-tooltip-enabled')
        a.innerHTML = `<i class='bx bx-expand'></i>`
        a.addEventListener('click', () => {
            openDetail(order.id)
            togglePage()
        })
        btn_group.append(a)
        a = document.createElement('a')
        a.classList.add('btn','btn-outline-danger','js-click-ripple-enabled','js-tooltip-enabled')
        a.innerHTML = ` <i class='bx bx-cart-download' ></i>`
        btn_group.append(a)
        /*
        <a id=${order.id} class="btn btn-outline-danger js-click-ripple-enabled js-tooltip-enabled" data-toggle="tooltip" data-placement="top" title="" data-original-title="Xem Chi Tiết">
            <i class='bx bx-expand'></i>
        </a>
        <a id=${order.id} class="btn btn-outline-danger js-click-ripple-enabled js-tooltip-enabled" data-toggle="tooltip" data-placement="top" title="" data-original-title="Tải Về">
            <i class='bx bx-cart-download' ></i>
        </a>
        */
        table.append(tr)
    })
})