const app = getApp();
let that;

Page({

	data: {
		// 我的所有列表
		my_works: [],
		openid: null,
		// 所有页数
		allPage: null,
		// 当前页数
		page: 1,
		// 是否编辑姓名
		isEdit: false,
		nowIndex: 0,
		// 改变的名字
		changeName: '',
		// 改变之前的名字
		beforName: '',
	},

	onLoad: function (options) {
		that = this

		let userInfo = wx.getStorageSync('userInfo');

		if (userInfo) {
			that.setData({
				openid: userInfo.openid,
				username: userInfo.username,
				headimg: userInfo.headimg
			});

			// 获取我的作品
			that.setDefaultWork();

		} else {
			wx.showToast({
				title: "由于您暂未登录，部分功能无法使用",
				icon: "none",
				duration: 3000,
				mask: true
			});

			return false;
		}

	},

	// 页面显示
	onShow() {

		if (wx.getStorageSync('takeZancun')) {

			let my_works = that.data.my_works;
			let takeZancun = wx.getStorageSync('takeZancun');

			my_works.forEach(item => {
				if (item.id === takeZancun.editID) {
					item.start = takeZancun.Preview[0].url;
					item.end = takeZancun.Preview[1].url;
					item.done = takeZancun.nowPage;
				}
			})
			that.setData({
				my_works: my_works
			})
			wx.removeStorageSync('takeZancun')
		} else {

			that.setData({
				my_works: [],
			})
			// 获取我的作品
			that.setDefaultWork();
		}
	},

	// 下拉加载
	onReachBottom: function () {
		let allPage = that.data.allPage
		let page = that.data.page

		if (page < allPage) {

			that.setData({
				page: page += 1
			})

			that.setDefaultWork()
		} else {
			app.showToast('已经加载所有作品', 'none')
		}
	},

	// 获取全部作品
	setDefaultWork() {
		let my_works = that.data.my_works
		let openid = that.data.openid
		let page = that.data.page

		let data = {
			openid: openid,
			page: page
		}

		app.request('text/all_list', data, res => {

			if (res.code === 200) {
				let result = res.data;

				let workList = [...result.data, ...my_works]

				that.setData({
					allPage: result.last_page,
					my_works: workList
				})

			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 编辑名字
	edit(e) {
		let noeindex = e.currentTarget.dataset.name;
		let my_works = that.data.my_works;

		let beforName = my_works[noeindex].name;

		that.setData({
			isEdit: true,
			nowIndex: noeindex,
			changeName: beforName,
			beforName: beforName,
		})
	},

	// 输入名字
	saveInput(e) {
		let changeName = e.detail.value;

		that.setData({
			changeName: changeName
		})
	},

	// 完成编辑
	finish(e) {

		let my_works = that.data.my_works;
		let nowIndex = that.data.nowIndex;
		let changeName = that.data.changeName;
		let beforName = that.data.beforName;

		if (changeName.length == 0) {
			app.showToast('不能为空', 'none');
			that.setData({
				isEdit: false,
			})
		} else {

			app.showLoading('加载中', 'none')

			let id = e.currentTarget.dataset.name;
			let name = that.data.changeName;
			let openid = that.data.openid;

			let data = {
				openid: openid,
				name: name,
				id: id
			}

			app.request('text/save_name', data, res => {

				if (res.code === 200) {

					my_works[nowIndex].name = changeName;

					that.setData({
						isEdit: false,
						my_works: my_works,
					})

					app.showToast('更改成功', 'none');

				} else {
					app.showToast(res.msg, 'none');
				}

				app.hideLoading();
			});
		}
	},

	// 去编辑
	toEdit(e) {

		let goodsId = e.currentTarget.dataset.name;
		let bianji = true;

		app.navigateTo('../edit/index?goodsId=' + goodsId + '&bianji=' + bianji)
	},

	// 删除模板
	del(e) {

		let id = e.currentTarget.dataset.name;
		let openid = that.data.openid;
		let my_works = that.data.my_works;

		let data = {
			id: id,
			openid: openid
		}

		app.request('text/data_del', data, res => {

			if (res.code === 200) {

				app.showToast('模板已删除', 'none');

				let new_works = my_works.filter(item => item.id != id)

				that.setData({
					my_works: new_works
				})

			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},


	// 去预览页面
	toPreview(e) {

		let id = e.currentTarget.dataset.name

		app.navigateTo('../prev/album?goodsId=' + id)

	},

})