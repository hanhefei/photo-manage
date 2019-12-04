const app = getApp();
let that;
let addressList;

Page({

	/* 页面的初始数据 */
	data: {
		// openid：用户唯一身份标识符
		openid: null,
		// 用户名
		username: "点击登录",
		// 用户头像
		headimg: 'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?w=640',
		num: 10
	},

	onLoad() {
		that = this;

		// 判断是否登录
		let isLogin = app.isLogin();

		if (isLogin == "暂未登录") {
			wx.showToast({
				title: "由于您暂未登录，部分功能无法使用",
				icon: "none",
				duration: 3000,
				mask: true
			});
			
			return false;
		}
	},

	onShow() {
		let submit = wx.getStorageSync("submit");
		let orderId = wx.getStorageSync("orderId");

		if (submit && orderId) {
			app.navigateTo("/pages/order/orderInfo?orderId=" + orderId);

			wx.removeStorageSync('submit');
			wx.removeStorageSync('orderId');
			
			return false;
		}

		let userInfo = wx.getStorageSync('userInfo');

		if (userInfo) {
			that.setData({
				openid: userInfo.openid,
				username: userInfo.username,
				headimg: userInfo.headimg
			});

			// 获取默认地址
			that.getDefaultAddress();

			// 获取我的作品
			that.setDefaultWork();
		}
	},

	// 通过按钮形式获取用户授权
	getUserInfo(e) {
		if (e.detail.userInfo) {
			let userInfo = e.detail.userInfo;

			// 微信登录
			app.login(() => {
				that.wxAithorize(userInfo);
			});
		}
	},

	// 微信登录
	wxAithorize(userInfo) {
		let code = wx.getStorageSync('code');

		let data = {
			code: code,
			username: userInfo.nickName,
			headimg: userInfo.avatarUrl
		};

		app.request('Login/Login', data, res => {
			if (res.code === 200) {
				let result = res.data;

				let userInfo = {
					user_id: result.user_id,
					openid: result.openid,
					username: result.username,
					headimg: result.headimg,
				};
				
				wx.removeStorageSync('code');

				wx.setStorageSync('userInfo', userInfo);

				wx.setStorageSync('openid', result.openid);

				that.setData({
					openid: result.openid,
					username: result.username,
					headimg: result.headimg
				});

				// 获取默认地址
				that.getDefaultAddress();
				
				// 获取我的作品
				that.setDefaultWork();
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 获取我的作品
	setDefaultWork() {
		let data = {
			openid: that.data.openid,
		}

		app.request('text/t_list', data, res => {
			if (res.code === 200) {
				let result = res.data;

				that.setData({
					my_workTen: result
				})

			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});

	},

	// 获取默认地址
	getDefaultAddress(page = 1) {
		let openid = that.data.openid;
		let data = {
			openid,
			page
		};

		app.request("Address/address_list", data, res => {
			if (res.code === 200) {
				let result = res.data;

				if (page == 1) {
					addressList = result;

					if (addressList.current_page < addressList.last_page) {
						let next_page = addressList.current_page + 1;

						that.getDefaultAddress(next_page);
					}

					if (addressList.current_page == addressList.last_page) {
						let hasDefault = addressList.data.some(el => {
							return el.is_default == 1;
						});

						if (hasDefault) {
							addressList.data.filter(el => {
								if (el.is_default == 1) {
									wx.setStorageSync("selectAddress", el);
								}
							});
						}
					}
				} else {
					addressList.current_page = page;

					addressList.data.concat(result.data);

					if (addressList.current_page < addressList.last_page) {
						let next_page = addressList.current_page + 1;

						that.getDefaultAddress(next_page);
					}

					if (addressList.current_page == addressList.last_page) {
						let hasDefault = addressList.data.some(el => {
							return el.is_default == 1;
						});

						if (hasDefault) {
							addressList.data.filter(el => {
								if (el.is_default == 1) {
									wx.setStorageSync("selectAddress", el);
								}
							});
						}
					}
				}

			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 去预览 编辑
	toPreview(e) {
		let id = e.currentTarget.dataset.name

		app.navigateTo('../prev/album?goodsId=' + id)
	},

	// 去我的作品
	toWork() {
		if (!that.data.openid) {
			app.showToast("您暂未登录，请登录后再进行操作", "none");

			return false;
		}

		app.navigateTo("/pages/user/my_work");
	},
	
	// 去我的订单
	toOrder() {
		if (!that.data.openid) {
			app.showToast("您暂未登录，请登录后再进行操作", "none");

			return false;
		}

		app.navigateTo("/pages/order/index");
	},

	// 去地址
	toAddress() {
		app.navigateTo("/pages/address/index");
	},

	// 去设置
	toSetting() {
		app.navigateTo("/pages/user/setting");
	},
	
	// 去反馈
	toFeedback() {
		app.navigateTo("/pages/user/feedback");
	},

	// 去账户设置页面
	toAccountSetting() {
		app.navigateTo("/pages/user/accountSetting");
	}

})