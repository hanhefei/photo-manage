// pages/finishedit/index.js
const app = getApp();
let that;

Page({

	data: {
		// ipt：输入内容
		ipt: "",
		allData: {},
		// isLogin：是否登录
		isLogin: false,
		// 编辑或新增
		isEdit: 1,
		// 首页
		firstPage: {},

		// 显示区域宽高
		width: null,
		height: null,
	},

	onLoad(e) {
		that = this;

		const query = wx.createSelectorQuery();
		query.select('.bg').boundingClientRect();
		query.selectViewport().scrollOffset();
		query.exec(function (res) {

			let width = res[0].width;
			let height = res[0].height;

			that.setData({
				width: width,
				height: height,
			});
		});

		let openid = wx.getStorageSync('openid');

		if (!openid) {
			that.setData({
				isLogin: true
			});
		}

		let text = JSON.parse(wx.getStorageSync('text'));

		that.setData({
			allData: text,
			firstPage: text.text[0],
			isEdit: e.isEdit,
			ipt: text.name
		})

		// 加载字体
		that.loadFont()
	},

	// 加载字体
	loadFont() {
		let firstPage = that.data.firstPage.filter(item => item.type == 'text')

		let num = 0
		function loadFond(num) {
			if (num != firstPage.length) {

				if (firstPage[num].familyUrl) {

					wx.loadFontFace({
						family: firstPage[num].family,
						source: `url('${firstPage[num].familyUrl}')`,
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
					isLogin: false
				});
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 保存输入
	saveInput(e) {
		let ipt = (e.detail.value).trim();

		if (ipt.length > 0) {
			that.setData({
				ipt: ipt
			});
		}
	},

	// 确定
	preview() {
		let ipt = that.data.ipt;
		let allData = that.data.allData;

		if (ipt.length > 0) {
			allData.name = ipt

			let openid = wx.getStorageSync('openid');
			let text = JSON.stringify(allData)

			let data = {
				openid: openid,
				data: text
			};

			wx.setStorageSync('text', text);

			// 发送暂存数据
			app.request('text/data', data, res => {

				let goodsId = res.data.id

				if (res.code === 200) {
					app.showToast(res.msg, 'none');

					app.navigateTo("/pages/prev/album?goodsId=" + goodsId);
				} else {
					app.showToast(res.msg, 'none');
				}
				app.hideLoading();
			});
		} else {
			app.showToast("您暂未输入相册名称", "none");
		}
	}

	// 预览相片书
	// previewBook() {
	// 	app.navigateTo("/pages/prev/photo_book");
	// }

})