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
        // prevBool：是否显示预览
        prevBool: false,
        // prevList：预览列表
        prevList: [],
        prevAllIndex: 0,
        prevIndex: 0,
        // 当前显示的预览照片
        nowImg: 0,

        flag: true,
        page_index: null,
        // width
        width: null,
        // height：参考高度
        height: null
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

    // 获取宽高信息
    getWHInfo() {
        // const query = wx.createSelectorQuery();
        // query.select('.everyBigPrev').boundingClientRect();
        // query.selectViewport().scrollOffset();
        // query.exec(function (res) {
        //     let width = res[0].width;
        //     let height = res[0].height;

        //     that.setData({
        //         width: width,
        //         height: height
        //     });
        // });

        const query = wx.createSelectorQuery();
        query.select('.everyPage').boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec(function (res) {

            let width = res[0].width;
            let height = res[0].height;

            that.setData({
                width: width,
                height: height,
            });
        });
    },

    // 预览相片书下一页
    nextPage() {

        let nowImg = that.data.nowImg
        let prevList = that.data.prevList

        if (nowImg * 2 < prevList.length - 2) {
            that.setData({
                nowImg: nowImg += 1
            })
        }
    },

    // 预览相片书上一页
    prevPage() {
        let nowImg = that.data.nowImg

        if (nowImg * 2 > 0) {
            that.setData({
                nowImg: nowImg -= 1
            })
        }
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
                that.getOrderTmpPrev();
            } else {
                app.showToast(res.msg, 'none');
            }

            app.hideLoading();
        });
    },

    // 获取订单模板预览图
    getOrderTmpPrev() {
        let openid = that.data.openid;
        let order_id = that.data.orderInfo.id;
        let data = {
            openid,
            order_id
        };

        app.request("order/detail", data, res => {
            if (res.code === 200) {
                let result = res.data;

                that.setData({
                    prevList: result,
                    prevAllIndex: result.length / 2
                });

                // 加载字体
                that.loadFont(result)

            } else {
                app.showToast(res.msg, 'none');
            }

            app.hideLoading();
        });
    },

    // 加载字体
    loadFont(allData) {

        let allNum = 0, num = 0, alltext = []

        function allList(allNum) {
            if (allNum != allData.length) {
                let nowData = allData[allNum];
                function nowList(num) {
                    if (num != nowData.length) {
                        if (nowData[num].type === 'text') {
                            alltext.push(nowData[num])
                        }
                        num += 1
                        nowList(num)
                    } else {
                        allNum += 1;
                        allList(allNum)
                    }
                }
                nowList(num)
            } else {

                let num = 0
                function loadFond(num) {
                    if (num != alltext.length) {
                        if (alltext[num].familyUrl) {
                            wx.loadFontFace({
                                family: alltext[num].family,
                                source: `url('${alltext[num].familyUrl}')`,
                                success() {
                                    num += 1;
                                    loadFond(num)
                                },
                                fail() {
                                    num += 1;
                                    loadFond(num)
                                }
                            })
                        } else {
                            num += 1;
                            loadFond(num)
                        }
                    }
                }
                loadFond(num)
            }
        }
        allList(allNum)
    },

    changePrev() {
        that.setData({
            prevBool: !that.data.prevBool
        });

        if (!that.data.width || !that.data.height) {
            that.getWHInfo();
        }
    },

    // 取消
    cancel() {
        let openid = that.data.openid;
        let orderInfo = that.data.orderInfo;
        let data = {
            openid,
            order_id: orderInfo.id
        };

        app.request("order/cancel", data, res => {
            if (res.code === 200) {
                orderInfo.status = 6;

                let orderHandle = {
                    orderHandleId: orderInfo.id,
                    handle: "cancel"
                };

                wx.setStorageSync('orderHandle', orderHandle);

                that.setData({
                    orderInfo: orderInfo
                });
            } else {
                app.showToast(res.msg, 'none');
            }

            app.hideLoading();
        });
    },

    // 支付
    pay() {
        let openid = that.data.openid;
        let orderInfo = that.data.orderInfo;
        let data = {
            openid,
            order_id: orderInfo.id
        };

        app.request('order/Payment', data, res => {
            if (res.code === 200) {
                let result = res.data;

                wx.requestPayment({
                    timeStamp: result.timeStamp,
                    nonceStr: result.nonceStr,
                    package: result.package,
                    signType: result.signType,
                    paySign: result.paySign,
                    success(res) {
                        if (res.errMsg == "requestPayment:ok") {
                            app.showToast("支付成功", "none");

                            orderInfo.status = 1;

                            that.setData({
                                orderInfo: orderInfo
                            });

                            let orderHandle = {
                                orderHandleId: orderInfo.id,
                                handle: "pay"
                            };

                            wx.setStorageSync('orderHandle', orderHandle);
                        }

                    },
                    fail(res) {
                        if (res.errMsg == "requestPayment:fail cancel") {
                            app.showToast("未完成支付", "none");
                        }
                    }
                });
            } else {
                app.showToast(res.msg, 'none');
            }

            app.hideLoading();
        })
    },

    // 收货
    give() {
        let openid = that.data.openid;
        let orderInfo = that.data.orderInfo;
        let data = {
            openid,
            order_id: orderInfo.id
        };

        app.request("order/receipt", data, res => {
            if (res.code === 200) {
                orderInfo.status = 4;

                let orderHandle = {
                    orderHandleId: orderInfo.id,
                    handle: "give"
                };

                wx.setStorageSync('orderHandle', orderHandle);

                that.setData({
                    orderInfo: orderInfo
                });
            } else {
                app.showToast(res.msg, 'none');
            }

            app.hideLoading();
        });
    },

    // 删除
    delete() {
        let openid = that.data.openid;
        let order_id = that.data.orderInfo.id;
        let data = {
            openid,
            order_id
        };

        app.request("order/del_order", data, res => {
            if (res.code === 200) {
                let orderHandle = {
                    orderHandleId: order_id,
                    handle: "delete"
                };

                wx.setStorageSync('orderHandle', orderHandle);

                app.navigateBack(1);
            } else {
                app.showToast(res.msg, 'none');
            }

            app.hideLoading();
        });
    },

    // 去物流详情
    toLogisticsIfon() {
        let orderId = that.data.orderId;

        app.navigateTo("/pages/order/logisticsIfon?orderId=" + orderId);
    },

    // change(e) {
    //     if (that.data.flag) {
    //         that.setData({
    //             flag: false
    //         });
    //         let index = e.currentTarget.dataset.index;
    //         let imgs = that.data.imgArr;
    //         imgs.map((ele, i) => {
    //             if (index == i) {
    //                 imgs[i].isturn = !imgs[i].isturn;
    //                 imgs[i].zIndex = 4;
    //             } else {
    //                 imgs[i].zIndex = 1;
    //             }
    //         })
    //         if (index - 1 >= 0) {
    //             imgs[index - 1].zIndex = 3;
    //         }
    //         if (index + 1 < imgs.length) {
    //             imgs[index + 1].zIndex = 3;
    //         }
    //         if (index - 2 >= 0) {
    //             imgs[index - 2].zIndex = 2;
    //         }
    //         if (index + 2 < imgs.length) {
    //             imgs[index + 2].zIndex = 2;
    //         }
    //         that.setData({
    //             imgArr: imgs,
    //             page_index: index
    //         });
    //     }
    // },

    // finish() {
    //     that.setData({
    //         // flag: true,
    //     });
    // },

    // finishPrev() {
    //     that.setData({
    //         prevIndex: that.data.prevIndex > 0 ? that.data.prevIndex - 1 : 0,
    //         // prev: false
    //     });
    // },

    // finishNext() {
    //     that.setData({
    //         prevIndex: that.data.prevIndex < that.data.prevAllIndex - 1 ? that.data.prevIndex + 1 : that.data.prevAllIndex - 1,
    //         // next: false
    //     });
    // },

    // prev() {
    //     that.setData({
    //         prev: true
    //     });
    // },

    // next() {
    //     that.setData({
    //         next: true
    //     });
    // }

})