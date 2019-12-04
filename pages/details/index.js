const app = getApp();
let WxParse = require('../../wxParse/wxParse.js');
let that;

Page({
    data: {
        title: null,
        info: null
    },

    onLoad: function(options) {
        that = this;

        that.getArtcle(options.id);
    },

    // 获取内容
    getArtcle: function (id) {
        app.request("text/article", { id: id }, (res) => {
            if (res.code == 200) {
                let result = res.data;

                WxParse.wxParse('info', 'html', result.content, that, 5);

                that.setData({
                    title: result.title
                });

                wx.setNavigationBarTitle({
                  title: result.title
                })
            } else {
                app.showToast(res.msg, 'none');
            }

            app.hideLoading();
        });
    }

})