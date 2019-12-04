const app = getApp();
let that;

Page({

    data: {
        // openid：用户身份唯一标识符
        openid: null,
        // orderId：订单id
        orderId: null,
        // orderInfo：订单信息
        orderInfo: {},
        // time：时间
        time: {},
        // logisticsDt：物流信息
        logisticsDt: {}
    },

    onLoad(options) {
        that = this;

        let openid = wx.getStorageSync('openid');

        that.setData({
            openid: openid,
            orderId: options.orderId
        });

        // 获取订单详情
        that.getOrderInfo();
    },

    // 获取订单详情
    getOrderInfo() {
        let openid = that.data.openid;
        let orderId = that.data.orderId;
        let data = {
            openid,
            order_id: orderId
        };

        app.request("order/time", data, res => {
            if (res.code === 200) {
                let result = res.data;

                that.setData({
                    orderInfo: result.order,
                    time: result.arr
                });

                // 获取订单模板预览图
                that.getLogistics();
            } else {
                app.showToast(res.msg, 'none');
            }

            app.hideLoading();
        });
    },

    // 获取物流数据
    getLogistics() {
        let openid = that.data.openid;
        let order_id = that.data.orderInfo.id;
        let data = {
            openid,
            order_id
        };

        app.request("order/express", data, res => {
            if (res.code === 200) {
                let result = res.data;
                let reg = /\((\d+)\)/;

                result.Traces.reverse().filter(el => {
                    if (el.AcceptStation.indexOf("已签收") > -1 || el.AcceptStation.indexOf("已送达") > -1) {
                        el.isShou = true;
                    } else {
                        el.isShou = false;
                    }

                    if (el.AcceptStation.indexOf("派件中") > -1 || el.AcceptStation.indexOf("派件") > -1) {
                        el.isPai = true;
                    } else {
                        el.isPai = false;
                    }

                    if (reg.test(el.AcceptStation)) {
                        el.tel = RegExp.$1;
                    }

                    el.date = el.AcceptTime.split(" ")[0].slice(5);
                    el.time = el.AcceptTime.split(" ")[1];
                });

                that.setData({
                    logisticsDt: result
                });
            } else {
                app.showToast(res.msg, 'none');
            }

            app.hideLoading();
        });
    },

    // 打电话
    call() {
        let logisticsDt = that.data.logisticsDt;
        let tel = "";
        
        if (logisticsDt.ShipperCode == "SF") {
            tel = "95338";
        }

        if (logisticsDt.ShipperCode == "HTKY") {
            tel = "95320";
        }

        if (logisticsDt.ShipperCode == "ZTO") {
            tel = "95311";
        }

        if (logisticsDt.ShipperCode == "STO") {
            tel = "95543";
        }

        if (logisticsDt.ShipperCode == "YTO") {
            tel = "95554";
        }
        
        if (logisticsDt.ShipperCode == "YD") {
            tel = "95546";
        }

        if (logisticsDt.ShipperCode == "HHTT") {
            tel = "400-188-8888";
        }

        if (logisticsDt.ShipperCode == "JD") {
            tel = "950616";
        }

        if (logisticsDt.ShipperCode == "ZJS") {
            tel = "400-678-9000";
        }

        wx.makePhoneCall({
            phoneNumber: tel
        });
    },

    // 配送电话
    callPai(e) {
        let tel = e.currentTarget.dataset.tel;

        wx.makePhoneCall({
            phoneNumber: tel
        });
    }

})