const app = getApp();
let that;

Page({

	data: {
		// 显示制作页面
		make: false,
		// buyNumber：购买数量
		buyNumber: 1,
		// money：钱
		money: 0,
		// bookMaterial：相册书材质
		bookMaterial: [],
		// bookSize：相册书大小
		bookSize: [],
		// materialIdx：材质索引
		materialIdx: null,
		// sizeIdx：尺寸索引
		sizeIdx: null,
		// 当前显示的预览照片
		nowImg: 0,
		// 商品ID
		goodsId: null,
		// 所有商品
		allData: {},

		// 宽高
		width: null,
		height: null
	},

	onLoad(options) {
		that = this;

		const query = wx.createSelectorQuery();
		query.select('.everyPage').boundingClientRect();
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
		let goodsId = options.goodsId;
		let data = {
			openid: openid,
			id: goodsId,
		};

		app.request('text/t_detail', data, res => {
			if (res.code === 200) {
				let result = res.data;

				that.setData({
					goodsId: goodsId,
					allData: result.text,
				})

				// 加载字体
				that.loadFont(result.text)
			}
			app.hideLoading();
		});

		// 获取材质
		that.getMaterial();

		// 获取大小
		that.getSize();
	},


	// 加载字体
	loadFont(allData) {

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

	// 预览相片书
	nextPage() {

		let nowImg = that.data.nowImg
		let allData = that.data.allData

		if (nowImg * 2 < allData.length - 2) {
			that.setData({
				nowImg: nowImg += 1
			})
		}
	},

	prevPage() {
		let nowImg = that.data.nowImg

		if (nowImg * 2 > 0) {
			that.setData({
				nowImg: nowImg -= 1
			})
		}
	},

	// 获取材质
	getMaterial() {
		app.request('text/material', {}, res => {
			if (res.code === 200) {
				let result = res.data;

				that.setData({
					bookMaterial: result
				});

			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 获取大小
	getSize() {
		app.request('text/size', {}, res => {
			if (res.code === 200) {
				let result = res.data;

				that.setData({
					bookSize: result
				});

			} else {
				app.showToast(res.msg, 'none');
			}
			app.hideLoading();
		});
	},

	// 选择规格
	selectThis(e) {
		let tp = e.currentTarget.dataset.tp;
		let idx = e.currentTarget.dataset.idx;

		if (tp == 'material') {
			that.setData({
				materialIdx: idx
			});
		} else {
			that.setData({
				sizeIdx: idx
			});
		}

		that.countNum();
	},

	countNum() {
		let bookMaterial = that.data.bookMaterial;
		let bookSize = that.data.bookSize;
		let materialIdx = that.data.materialIdx;
		let sizeIdx = that.data.sizeIdx;
		let buyNumber = that.data.buyNumber;

		if (typeof materialIdx != "number" || typeof sizeIdx != "number") {
			return false;
		} else {

			let money = Math.abs((Math.abs(bookMaterial[materialIdx].price) * Math.abs(bookSize[sizeIdx].price)) * buyNumber)

			that.setData({
				// money: (parseInt(bookMaterial[materialIdx].price) + parseInt(bookSize[sizeIdx].price)) * buyNumber
				money: Math.round(money * 100) / 100
			});
		}
	},

	// 增加数量
	buy_add() {
		that.setData({
			buyNumber: that.data.buyNumber += 1
		});

		that.countNum();
	},

	// 减少数量
	buy_reduce() {
		if (that.data.buyNumber > 1) {
			that.setData({
				buyNumber: that.data.buyNumber -= 1
			});

			that.countNum();
		}
	},

	make() {
		that.setData({
			make: true
		})
	},

	toSubmit() {
		if (typeof that.data.materialIdx != "number" || typeof that.data.sizeIdx != "number") {
			app.showToast("请选择材质和尺寸！", "none");

			return false;
		}

		let materialId = that.data.bookMaterial[that.data.materialIdx].id;
		let sizeIdx = that.data.bookSize[that.data.sizeIdx].id;
		let buyNumber = that.data.buyNumber;
		let money = that.data.money;
		let id = that.data.goodsId;

		app.navigateTo("/pages/order/submit?mid=" + materialId + "&zid=" + sizeIdx + "&num=" + buyNumber + "&price=" + money + "&tid=" + id);
	}

})