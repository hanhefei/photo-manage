// let apiUrl = "https://cl.kangzihang.top/api/";

let apiUrl = "https://yyxc.top/api/";

function httpRequest(type, url, data) {
    wx.showLoading({
        title: '加载中',
        mask: true
    });

    return new Promise((resolve, reject) => {
        wx.request({
            url: apiUrl + url,
            data: data,
            header: {
                'content-type': type == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded'
            },
            method: type,
            dataType: 'json',
            responseType: 'text',
            success: (res) => {
                resolve(res.data)
            },
            fail: (res) => {
                reject(res)
            }
        });
    });
}

function updateImg(num, callback) {
    wx.chooseImage({
        count: num,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
            wx.showLoading({
                title: '图片上传中',
                mask: true
            });

            // tempFilePath可以作为img标签的src属性显示图片
            const tempFilePaths = res.tempFilePaths;

            let i = 0;
            let imgArr = [];

            function upFile() {
                wx.uploadFile({
                    url: apiUrl + "Upload/upload",
                    filePath: tempFilePaths[i],
                    name: 'file',
                    success(res) {

                        const result = JSON.parse(res.data);

                        imgArr.push(result)

                        i++;

                        if (i < tempFilePaths.length) {
                            upFile()
                        } else {
                            callback(imgArr)
                        }
                    }
                })
            }

            upFile()
        }
    })

}

function formYearMonthDay(dateTime) {
    var date = new Date(dateTime);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var s = (year < 10 ? ('0' + year) : year) + '-' + (month < 10 ? ('0' + month) : month) + '-' + (day < 10 ? ('0' + day) : day);
    return s;
}

module.exports = {
    httpRequest: httpRequest,
    updateImg: updateImg,
    formYearMonthDay: formYearMonthDay
}