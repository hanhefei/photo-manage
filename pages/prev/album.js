// pages/finishedit/preview.js
import Card from '../../palette/card';

const app = getApp();
let that;
let innerAudioContext;

Page({

	data: {
		// openid：用户身份值
		openid: null,
		current: 0,
		// 商品ID
		goodsId: null,
		// 是否是编辑
		isEdit: false,
		// isShare：是否是分享的
		isShare: false,
		// start：预览图
		start: "",
		// codeImg：二维码图片
		codeImg: "",
		// tmpName：模板名称
		tmpName: "",
		// 所有数据
		allData: {},
		// 音乐
		music: '',
		// 操作音乐
		takeMusic: true,

		// 显示的宽高
		width: null,
		height: null,
		// template：数据
		template: null,

		changeWidth: 'width: 375px',
		changeHeight: 'height: 667px'
	},

	onLoad(options) {
		that = this;

		wx.hideShareMenu();

		const query = wx.createSelectorQuery();
		query.select('.swiper').boundingClientRect();
		query.selectViewport().scrollOffset();
		query.exec(function (res) {

			let width = res[0].width;
			let height = res[0].height;

			that.setData({
				width: width,
				height: height,
			});
		});

		let pages = getCurrentPages();

		if (pages.length > 1) {

			let prevpage = pages[pages.length - 2];

			if (prevpage.route === "pages/prev/index") {

				// 拉取数据
				let openid = wx.getStorageSync('openid');
				let id = options.goodsId;
				let data = {
					openid: openid,
					id: id
				};

				app.request('text/t_detail', data, res => {

					if (res.code === 200) {
						let result = res.data;

						that.setData({
							start: result.start,
							music: result.music,
							goodsId: options.goodsId,
							tmpName: result.name,
							allData: result.text,
						})

						// 加载字体
						that.loadFont(result.text)

						if (result.music != null) {
							that.Playmusic()
						} else {
							that.setData({
								takeMusic: false
							})
						}
					}
					app.hideLoading();
				});
			} else {
				that.setData({
					goodsId: options.goodsId,
					isEdit: true
				})
				that.editData()
			}
		} else {

			that.setData({
				goodsId: options.goodsId,
				isShare: true
			});

			if (options.where == "all") {
				that.shareData();
			} else {
				that.editData();
			}
		}

		that.getCode();
	},

	onShow() {

		if (that.data.isEdit) {
			let openid = wx.getStorageSync('openid');
			let id = that.data.goodsId;

			let data = {
				openid: openid,
				id: id
			};

			app.request('text/t_detail', data, res => {
				if (res.code === 200) {
					let result = res.data;

					that.setData({
						start: result.start,
						music: result.music,
						tmpName: result.name,
						allData: result.text,
					})

					// 加载字体
					that.loadFont(result.text)

					if (result.music != null) {
						that.Playmusic()
					} else {
						that.setData({
							takeMusic: false
						})
					}
				} else {
					app.showToast(res.msg, 'none');
				}
				app.hideLoading()
			});
		}


		that.setData({
			openid: wx.getStorageSync('openid')
		});

		let whereBack = wx.getStorageSync('whereBack');

		if (whereBack) {
			that.setData({
				current: 0
			});

			wx.removeStorageSync('whereBack');
		}

		innerAudioContext = wx.createInnerAudioContext();
		innerAudioContext.loop = true;

		if (that.data.music) {
			that.Playmusic();
		}
	},

	// 加载字体
	loadFont(allData) {

		let allNum = 0, num = 0, alltext = []

		function allList(allNum) {
			if (allNum != allData.length) {
				let nowData = allData[allNum]

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
				let everyFont = 0;
				function loadFond(everyFont) {
					if (everyFont != alltext.length) {

						if (alltext[everyFont].familyUrl) {

							wx.loadFontFace({
								family: alltext[everyFont].family,
								source: `url('${alltext[everyFont].familyUrl}')`,
								success() {
									everyFont += 1;
									loadFond(everyFont)
								},
								fail() {
									num += 1;
									loadFond(num)
								}
							})
						} else {
							everyFont += 1;
							loadFond(everyFont)
						}
					}
				}
				loadFond(everyFont)
			}
		}
		allList(allNum)
	},

	onShareAppMessage(res) {
		let id = res.target.dataset.id;
		let name = res.target.dataset.name;
		let start = that.data.start;

		if (res.from === 'button') {
			// 来自页面内转发按钮
			return {
				title: 'Hi~快来看看我刚做的“' + name + '”相册吧！',
				path: '/pages/prev/album?goodsId=' + id + '&where=user',
				imageUrl: start
			}
		}
	},

	// 获取二维码
	getCode() {
		let openid = wx.getStorageSync('openid');
		let id = that.data.goodsId;

		let data = {
			openid: openid,
			path: "/pages/prev/album",
			t_id: id
		};

		app.request('text/getwxaqrcode', data, res => {
			if (res.code === 200) {
				let result = res.data;

				that.setData({
					codeImg: result
				})
			} else {
				app.showToast(res.msg, 'none');
			}
			app.hideLoading()
		});
	},

	// 拉取数据（首页分享）
	shareData() {

		let openid = wx.getStorageSync('openid');
		let id = that.data.goodsId;
		let data = null;

		if (openid) {
			data = {
				openid: openid,
				id: id
			};
		} else {
			data = {
				id: id
			};
		}

		app.request('text/r_detail', data, res => {
			if (res.code === 200) {
				let result = res.data;

				wx.setStorageSync('allData', result);

				that.setData({
					start: result.start,
					allData: result.text,
					tmpName: result.name,
					takeMusic: false
				})

				// 加载字体
				that.loadFont(result.text)

			} else {
				app.showToast(res.msg, 'none');
			}
			app.hideLoading();
		});
	},

	// 拉取编辑数据（个人分享）
	editData() {

		let openid = wx.getStorageSync('openid');
		let id = that.data.goodsId;
		let data = null;

		if (openid) {
			data = {
				openid: openid,
				id: id
			};
		} else {
			data = {
				id: id
			};
		}

		app.request('text/t_detail', data, res => {
			if (res.code === 200) {
				let result = res.data;

				that.setData({
					start: result.start,
					allData: result.text,
					tmpName: result.name,
					music: result.music
				})

				// 加载字体
				that.loadFont(result.text)

				if (result.music != null) {
					that.Playmusic()
				} else {
					that.setData({
						takeMusic: false
					})
				}
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 播放音乐
	Playmusic() {
		let src = that.data.music

		innerAudioContext.src = src

		innerAudioContext.play();

		that.setData({
			takeMusic: true
		})
	},

	// 操作音乐
	takeMusic() {

		let takeMusic = that.data.takeMusic

		let src = that.data.music

		if (!src) {

			app.showToast('当前模板没有音乐', 'none')

		} else {

			if (takeMusic === true) {

				innerAudioContext.pause();

				that.setData({
					takeMusic: false
				})
			} else {

				innerAudioContext.play();

				that.setData({
					takeMusic: true
				})
			}
		}
	},

	// 销毁音乐
	onUnload() {
		innerAudioContext.destroy()

		that.setData({
			takeMusic: false
		});
	},

	// 去编辑页面
	toEdit() {
		let goodsId = that.data.goodsId

		that.onUnload();
		wx.setStorageSync('whereBack', true);
		app.navigateTo("../edit/index?goodsId=" + goodsId);
	},

	// 去首页
	toIndex() {
		that.onUnload();
		app.reLaunch("/pages/index/index");
	},

	// 改变索引
	changeCurrent(e) {

		if (e.detail.source === 'touch') {

			that.setData({
				current: e.detail.current
			});
		}

	},

	// 去相片书页
	toMaking() {
		that.onUnload();

		wx.setStorageSync('whereBack', true);

		let goodsId = that.data.goodsId

		app.navigateTo("/pages/prev/photo_book?goodsId=" + goodsId);
	},

	onImgOK(e) {
		that.imagePath = e.detail.path;
	},

	// 保存二维码
	saveCode() {
		app.showLoading("保存中");
		let run = null;

		let userName = wx.getStorageSync('userInfo').username;
		userName = userName.length > 6 ? userName.slice(0, 5) : userName;
		let start = that.data.start;
		let codeImg = that.data.codeImg;
		let prevName = that.data.tmpName.length > 6 ? that.data.tmpName.slice(0, 5) + '...' : that.data.tmpName;

		let obj = new Card().palettes(start, codeImg, prevName, userName);

		that.setData({
			template: obj,
			changeWidth: 'width: 375px',
			changeHeight: 'height: 667px'
		});

		run = setInterval(() => {
			if (that.imagePath) {
				clearInterval(run);

				app.saveImg(() => {
					wx.saveImageToPhotosAlbum({
						filePath: that.imagePath,
						success(res) {
							if (res.errMsg == "saveImageToPhotosAlbum:ok") {
								app.hideLoading();

								that.setData({
									template: null,
									changeWidth: "width: 0;",
									changeHeight: "height: 0;"
								});

								app.showToast("保存成功", "success");
							}
						},
						fail(res) {
							app.hideLoading();

							that.setData({
								template: null,
								changeWidth: "width: 0;",
								changeHeight: "height: 0;"
							});

							app.showToast("已取消保存", "none");
						},
						complete() {
							wx.removeStorageSync('savedFiles');
						}
					})
				});

			}
		}, 500)
	}

})