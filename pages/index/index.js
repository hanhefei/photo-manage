// pages/home/index.js
const app = getApp();
let that;

Page({

    data: {
        // imgUrls：轮播图数据
        imgUrls: [
            'https://images.unsplash.com/photo-1551446591-142875a901a1?w=640'
        ],
        // hotRecommend：推荐模板列表
        hotRecommend: [],
        // swiper_current：轮播图索引
        swiper_current: 0,
        // swiperIndex：热门推荐轮播图索引
        swiperIndex: 0,
        // isIphoneX：是否是苹果x
        isIphoneX: app.globalData.isIphoneX
    },

    onLoad() {
        that = this;

        wx.hideShareMenu();
    },

    onShow() {
        // 获取轮播图数据
        that.getCarousel();

        // 获取热门推荐数据
        that.getRecommend();
    },

    onShareAppMessage(res) {
        let id = res.target.dataset.id;
        let img = res.target.dataset.img;

        if (res.from === 'button') {
            // 来自页面内转发按钮
            return {
                title: '我发现了一个超好看的免费相册模板，你也来试试吧！',
                path: '/pages/prev/album?goodsId=' + id + '&where=all',
                imageUrl: img
            }
        }
    },

    // 获取轮播图数据
    getCarousel() {
        app.request('text/map', {}, res => {
            if (res.code === 200) {
                let result = res.data.reverse();
                let imgUrls = [
                    {
                      img: 'https://images.unsplash.com/photo-1551446591-142875a901a1?w=640'
                    }
                ];

                result.filter(el => {
                    imgUrls.unshift({
                        aid: el.aid,
                        img: el.image
                    });
                });

                that.setData({
                    imgUrls: imgUrls
                });
            } else {
                app.showToast(res.msg, 'none');
            }

            app.hideLoading();
        });
    },

    // 获取热门推荐数据
    getRecommend() {
        app.request('text/template_hot', {}, res => {
            if (res.code === 200) {
                let result = res.data.reverse();
                let hotRecommend = [
                    {
                        name: "点击查看全部模板",
                        selected: false,
                        start: '/resources/imgs/Leftslide.png'
                    }
                ];

                result.filter(el => {
                    hotRecommend.unshift(el);
                });

                that.setData({
                    hotRecommend: hotRecommend
                });
            } else {
                app.showToast(res.msg, 'none');
            }

            app.hideLoading();
        });
    },

    // 索引改变
    changeCurrent(e) {
        that.setData({
            swiper_current: e.detail.current
        });
    },

    // 热们推荐切换
    swiperChange(e) {
        that.setData({
            swiperIndex: e.detail.current
        });
    },

    // 去模板
    toTmpInfo(e) {
        let id = e.currentTarget.dataset.id;

        if (id) {
            app.navigateTo("/pages/tmp/tmplist?id=" + id);
        } else {
            app.navigateTo("/pages/tmp/alltmp");
        }

    },

    // 去详情
    toDetails(e) {
        let id = e.currentTarget.dataset.id;
        app.navigateTo("/pages/details/index?id=" + id);
    },

    // 去问题反馈
    toFeedback() {
        app.navigateTo("/pages/user/feedback");
    }

})