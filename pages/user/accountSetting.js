const app = getApp();
let that;

Page({

	data: {
		// openid：唯一身份标识符
		openid: null,
		// username：用户名
		username: null,
		// headimg：头像
		headimg: null,
		// ipt：输入值
		ipt: null,
		// imgUrl：图片路径
		imgUrl: null
	},

	onLoad() {
		that = this;

		let userInfo = wx.getStorageSync('userInfo');

		if (userInfo) {
			that.setData({
				openid: userInfo.openid,
				username: userInfo.username,
				headimg: userInfo.headimg,
				ipt: userInfo.username,
				imgUrl: userInfo.headimg
			});
		}
	},

	// 改变图片
	changeImg() {
		app.globalData.util.updateImg(1, (imgArr) => {
			that.setData({
				imgUrl: imgArr[0].url
			});

			app.hideLoading();
		});
	},

	// 保存输入值
	saveInput(e) {
		let ipt = (e.detail.value).trim();

		if (ipt.length > 0) {
			that.setData({
				ipt: ipt
			});
		}
	},

	saveInfo() {
		let userInfo = wx.getStorageSync('userInfo');
		let openid = that.data.openid;
		let imgUrl = that.data.imgUrl;
		let ipt = that.data.ipt;
		let username = that.data.username;
		let headimg = that.data.headimg;

		if (!imgUrl && !ipt) {
			app.showToast('请改变后再进行保存', 'none');

			return false;
		} else {
			if (imgUrl == headimg && ipt == username) {
				app.showToast('请改变后再进行保存', 'none');

				return false;
			} else {
				let data = {
					openid: openid,
					username: ipt,
					headimg: imgUrl
				};

				app.request('text/user', data, res => {
					if (res.code === 200) {
						let result = res.data;
						userInfo.username = result.username;
						userInfo.headimg = result.headimg;

						that.setData({
							username: result.username,
							headimg: result.headimg,
							ipt: result.username,
							imgUrl: result.headimg
						});

						wx.setStorageSync('userInfo', userInfo);

						app.showToast("修改成功", "success");

						setTimeout(() => {
							app.switchTab("/pages/user/index");
						}, 2000);
						
					} else {
						app.showToast(res.msg, 'none');
					}

					app.hideLoading();
				});
			}
		}
	}

})