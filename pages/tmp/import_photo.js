const app = getApp();
let that;

Page({

	data: {
		// 模板ID
		tmpId: 0,
		// allPicture：选择图片
		allPicture: [],
		// pictureLocation：图片位置
		pictureLocation: [],
		// startX：开始位置x
		startX: 0,
		// startY：开始位置y
		startY: 0,
		// delOrIn：底部删除显隐
		delOrIn: false,
		// selectImgId：获取选中图片ID
		selectImgId: 0,
		// showCopyImg：显示拖拽图片
		showCopyImg: false,
		// changeImgID：要更换的图片ID
		changeImgID: null,
		// 页面照片信息
		allPageImg: [],
	},

	onLoad(options) {
		that = this;

		that.setData({
			tmpId: options.id
		});

		// 获取模板信息
		that.getTmpDt(options.id);
	},

	// 获取模板信息
	getTmpDt(id) {
		app.request('text/detail', {
			id: id
		}, res => {
			if (res.code === 200) {
				let result = res.data.text;

				function flatten(result) {
					var res = [];
					for (var i = 0; i < result.length; i++) {
						if (Array.isArray(result[i])) {
							res = res.concat(flatten(result[i]));
						} else if (result[i].type === 'frame') {
							res.push(result[i]);
						}
					}
					return res;
				}
				let allPageImg = flatten(result)

				that.setData({
					allPageImg: allPageImg
				})

			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 清除更换按钮
	clean() {
		that.setData({
			changeImgID: null
		});
	},

	// 添加照片
	addImg() {
		let wareDescImg = that.data.allPicture;
		let allPageImg = that.data.allPageImg.length;

		let num = allPageImg - wareDescImg.length;


		app.globalData.util.updateImg(num, (imgArr) => {
			wx.showLoading({
				title: '图片上传中',
				mask: true
			});

			imgArr.filter((element) => {
				wareDescImg.push(element);
			});

			that.setData({
				allPicture: wareDescImg
			});

			that.getImgSite();

			setTimeout(function () {
				app.hideLoading();
			}, 3000);
		});
	},

	// 获取图片位置
	getImgSite() {
		let pictureLocation = [];
		const query = wx.createSelectorQuery();
		query.selectAll('.localimg').boundingClientRect();
		query.exec(function (res) {
			for (let i of res[0]) {
				pictureLocation.push({
					top: i.top,
					left: i.left,
					width: i.width,
					height: i.height
				});
			}

			that.setData({
				pictureLocation: pictureLocation
			});
		});
	},

	// 更换照片
	changeImg() {
		let wareDescImg = that.data.allPicture;
		let changeImgID = that.data.changeImgID;
		let num = 1;

		app.globalData.util.updateImg(num, (imgArr) => {
			let newWareDescImg = wareDescImg.map((item, index) => index == changeImgID ? imgArr[0] : item);

			that.setData({
				allPicture: newWareDescImg
			});

			setTimeout(function () {
				app.hideLoading();
			}, 2000);
		});
	},

	// 点击事件
	bind(e) {
		let changeImgID = e.target.dataset.name;

		that.setData({
			changeImgID
		});
	},

	// 长按事件
	bindlongtap(e) {
		let startX = e.changedTouches[0].pageX;
		let startY = e.changedTouches[0].pageY;

		that.setData({
			showCopyImg: true,
			delOrIn: true,
			startX: startX,
			startY: startY
		});
	},

	// 触摸开始
	touchstart(e) {
		let selectImgId = e.currentTarget.dataset.name;

		that.setData({
			selectImgId: selectImgId
		});
	},

	// 触摸移动
	touchmove(e) {
		let startX = e.changedTouches[0].pageX;
		let startY = e.changedTouches[0].pageY;

		that.setData({
			startX: startX,
			startY: startY
		});
	},

	// 触摸结束
	end(e) {
		let newAllPicture = that.data.allPicture;
		let pictureLocation = that.data.pictureLocation;
		let selectImgId = that.data.selectImgId;
		let tmpDt = null;

		pictureLocation.filter((el, idx) => {
			if (e.changedTouches[0].pageX >= el.left && e.changedTouches[0].pageX <= (el.left + el.width) && e.changedTouches[0].pageY >= el.top && e.changedTouches[0].pageY <= (el.top + el.height)) {
				tmpDt = newAllPicture[selectImgId];
				newAllPicture[selectImgId] = newAllPicture[idx];
				newAllPicture[idx] = tmpDt;
			}
		});

		//获取删除区域 
		let height = wx.getSystemInfoSync().windowHeight - 83;

		if (e.changedTouches[0].clientY > height) {
			newAllPicture.splice(selectImgId, 1);
		}

		that.setData({
			allPicture: newAllPicture,
			showCopyImg: false,
			delOrIn: false
		});

		that.getImgSite();
	},

	// 去编辑页面
	toEdit() {
		let allPicture = JSON.stringify(that.data.allPicture);
		let id = that.data.tmpId

		wx.setStorageSync('allPicture', allPicture);

		app.navigateTo("/pages/edit/index?id=" + id);
	}

})