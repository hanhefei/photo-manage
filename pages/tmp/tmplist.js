// pages/home/Templates/select.js
const app = getApp();
let that;

Page({

	data: {
		// tmpId：当前模板id
		tmpId: null,
		// Showfree：是否免费
		Showfree: false,
		// previewIsShow：预览显隐
		previewIsShow: false,
		// tmpName：模板名称
		tmpName: null,
		// tmpPrev：模板预览图
		tmpPrev: null,
		// tmpPhoto：模板页面
		tmpPhoto: [],
		// tmpPhotoNum：模板页面数量
		tmpPhotoNum: 20,
		// previewIdx：预览索引
		previewIdx: null,
		// referWidth：参照宽度
		referWidth: 0,
		// referHeight：参照高度
		referHeight: 0,
		// width
		width: 0,
		// height
		height: 0
	},

	onLoad(options) {
		that = this;

		wx.hideShareMenu();

		that.setData({
			tmpId: options.id
		});

		// 获取模板信息
		that.getTmpDt(options.id);
	},

	onShow() {
		let allPicture = wx.getStorageSync('allPicture');

		if (allPicture) {
			wx.removeStorageSync('allPicture');
		}
	},

	onShareAppMessage(res) {
		let id = res.target.dataset.id;
		let tmpPrev = that.data.tmpPrev;

		if (res.from === 'button') {
			// 来自页面内转发按钮
			return {
				title: '我发现了一个超好看的免费相册模板，你也来试试吧！',
				path: '/pages/prev/album?goodsId=' + id + '&where=all',
				imageUrl: tmpPrev
			}
		}
	},

	// 获取宽高信息
	getWHInfo() {
		const query = wx.createSelectorQuery();
		query.select('.everySmallImg').boundingClientRect();
		query.selectViewport().scrollOffset();
		query.exec(function (res) {
			let width = res[0].width;
			let height = res[0].height;

			that.setData({
				referWidth: width,
				referHeight: height
			});
		});
	},

	// 获取预览宽高信息
	getPrevWHInfo() {
		const query = wx.createSelectorQuery();
		query.select('.everyPage').boundingClientRect();
		query.selectViewport().scrollOffset();
		query.exec(function (res) {
			let width = res[0].width;
			let height = res[0].height;

			that.setData({
				width: width,
				height: height
			});
		});
	},

	// 获取模板信息
	getTmpDt(id) {
		app.request('text/detail', {
			id: id
		}, res => {
			if (res.code === 200) {
				let result = res.data;

				wx.setNavigationBarTitle({
					title: result.name
				});

				that.setData({
					tmpName: result.name,
					tmpPrev: result.start,
					tmpPhoto: result.text,
					tmpPhotoNum: result.text.length,
					Showfree: result.is_share === 0 ? true : false
				});

				console.log(result);
				

				// 加载字体
				that.loadModuleFont(result.text)

				// 获取宽高信息
				that.getWHInfo();
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 加载字体
	loadModuleFont(allData) {

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

	// 开始制作
	changeFree() {
		that.setData({
			Showfree: !that.data.Showfree
		});
	},

	// 打开预览
	preview(e) {
		let previewIdx = e.currentTarget.dataset.index;

		that.setData({
			previewIsShow: true,
			previewIdx: previewIdx
		});

		// 获取预览宽高信息
		that.getPrevWHInfo();
	},

	// 关闭预览
	closePreview() {
		that.setData({
			previewIsShow: false
		});
	},

	// 跳转至批量导入图片
	toImportPicture() {
		let id = that.data.tmpId

		app.navigateTo('/pages/tmp/import_photo?id=' + id);
	},

	// 跳转至编辑页面
	toEdit() {
		let allPicture = JSON.stringify([]);
		let id = that.data.tmpId

		wx.setStorageSync('allPicture', allPicture);

		app.navigateTo("/pages/edit/index?id=" + id);
	}
})