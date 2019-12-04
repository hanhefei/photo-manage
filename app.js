//app.js
const util = require('./utils/util.js');
let that;

App({

	globalData: {
		// util：处理文件
		util,
		// system：系统属性
		system: "",
		// isIphoneX：是否是苹果x
		isIphoneX: false,
		// userInfo：用户信息
		userInfo: {}
	},

	onLaunch() {
		that = this;

		let version = that.getSystem();

		// 判断是否登录
		// that.isLogin();

		// 判断目前小程序版本是否支持所有功能
		// if (that.compareVersion(version, '2.3.0') < 0) {
		//     wx.showModal({
		//         title: '提示',
		//         content: '当前微信版本过低，部分功能无法使用，请升级到最新微信版本后重试。',
		//         showCancel: false,
		//         success (res) {
		//             if (res.confirm) {
		//                 wx.setStorageSync('versionSuccess', 'no');
		//             }
		//         }
		//     });
		// } else {
		//     wx.setStorageSync('versionSuccess', 'yes');
		// }
	},

	// 获取设备信息
	getSystem() {
		try {
			const res = wx.getSystemInfoSync();

			if (res.model.search('iPhone X') != -1) {
				that.globalData.isIphoneX = true;
			}

			that.globalData.system = res;

			return res.SDKVersion;
		} catch (e) {
			// Do something when catch error
		}
	},

	// 进行版本比较
	compareVersion(v1, v2) {
		v1 = v1.split('.');
		v2 = v2.split('.');
		const len = Math.max(v1.length, v2.length);

		while (v1.length < len) {
			v1.push('0');
		}
		while (v2.length < len) {
			v2.push('0');
		}

		for (let i = 0; i < len; i++) {
			const num1 = parseInt(v1[i]);
			const num2 = parseInt(v2[i]);

			if (num1 > num2) {
				return 1;
			} else if (num1 < num2) {
				return -1;
			}
		}

		return 0;
	},

	// 检测当前API是否可以使用
	testingApi(apiString) {
		var bool = wx.canIUse(apiString);

		return bool;
	},

	// 获取code
	login(callback) {
		wx.login({
			success(res) {
				if (res.code) {

					wx.setStorageSync('code', res.code);

					callback();
				} else {
					console.log('获取失败！' + res.errMsg);
				}
			}
		});
	},

	// 是否登录
	isLogin() {
		if (!wx.getStorageSync('userInfo') || !wx.getStorageSync('openid')) {
			return '暂未登录';
		}
	},

	// 普通跳转
	navigateTo(url) {
		wx.navigateTo({
			url: url
		});
	},

	// 后退
	navigateBack(num) {
		wx.navigateBack({
			delta: num
		});
	},

	// 重定向跳转
	redirectTo(url) {
		wx.redirectTo({
			url: url
		});
	},

	// 清除之前的所有页面栈并跳转
	reLaunch(url) {
		wx.reLaunch({
			url: url
		});
	},

	// 清除之前的所有页面栈并跳转到tabbar
	switchTab(url) {
		wx.switchTab({
			url: url
		});
	},

	// 显示加载中
	showLoading(title) {
		wx.showLoading({
			title: title,
			mask: true
		});
	},

	// 隐藏加载中
	hideLoading() {
		wx.hideLoading();
	},

	// 显示消息提示框
	showToast(title, type) {
		wx.showToast({
			title: title,
			icon: type,
			duration: 2000,
			mask: true
		});
	},

	// 弹框之后的操作
	afterHandle(callback) {
		let run;

		run = setTimeout(() => {
			callback();

			clearTimeout(run);
		}, 2000);
	},

	// 请求
	request(url, data, callback) {
		util.httpRequest('POST', url, data).then(res => {
			callback(res);
		}).catch(error => {
			console.log(error);

			that.hideLoading();
		});
	},

	// 保存图片
	saveImg: function (callback) {
		wx.getSetting({
			success: function () {

				wx.authorize({
					scope: 'scope.writePhotosAlbum',
					success: function () {
						callback();
					},
					fail: function () {

						wx.getSetting({
							success: function (res) {

								if (!res.authSetting['scope.writePhotosAlbum']) {

									wx.showModal({
										title: '提示',
										content: '您必须允许保存图片才能进行操作',
										showCancel: false,
										confirmText: '确定',
										confirmColor: '#576B95',
										success: function () {
											wx.openSetting({
												success: function () {
													that.saveImg(callback);
												}
											})
										}
									});

								}

							}
						})

					}
				})

			}
		})
	}

})