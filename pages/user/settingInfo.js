const app = getApp();
let that;

Page({

	data: {
		// phone：手机号
		phone: null,
		// txt：关于我们
		txt: null,
		// tp：类型
		tp: null
	},

	onLoad(options) {
		that = this;

		that.setData({
			tp: options.tp
		});

		// 获取相关信息
		that.getSettingInfo();
	},

	// 获取相关信息
	getSettingInfo() {
		app.request('text/system', {}, res => {
			if (res.code === 200) {
				let result = res.data;

				that.setData({
					phone: result.phone,
					txt: result.about
				});
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 打电话
	call() {
		let phone = that.data.phone;

		wx.makePhoneCall({
			phoneNumber: phone
		})
	}

})