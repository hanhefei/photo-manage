const app = getApp();
let that;

Page({

	data: {
		// login：是否登录
		login: false
	},

	onLoad() {
		that = this;

		let userInfo = wx.getStorageSync('userInfo');

		if (userInfo) {
			that.setData({
				login: true
			});
		}
	},

	// 提示
	showToast() {
		app.showToast('您暂未登陆，请登录后再进行操作', 'none');
	},

	// 去账号设置
	toAccount() {
		app.navigateTo('/pages/user/accountSetting');
	},

	// 去问题反馈
	toFeedBack(){
		app.navigateTo('/pages/user/feedback');
	},

	// 去设置详情
	toDetails(e) {
		let tp = e.currentTarget.dataset.tp;
		app.navigateTo('/pages/user/settingInfo?tp=' + tp);
	}

})