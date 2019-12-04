const app = getApp();
let that;

Page({

	data: {
		// openid：用户唯一id
		openid: null,
		// address_list：地址列表
		address_list: [],
		// current_page：当前页数
		current_page: null,
		// last_page：最后页数
		last_page: null,
		// backSubmit：从提交页面过来
		backSubmit: false,
		// selectId：选中地址
		selectId: null
	},

	onLoad(options) {
		that = this;
		let openid = wx.getStorageSync('openid');

		if (openid) {
			that.setData({
				openid: openid
			});

			if (options.where && options.where == "submit") {
				that.setData({
					backSubmit: true
				});
			}
		} else {
			app.showToast('由于您暂未登录，部分功能无法使用', 'none');

			return false;
		}
	},

	onShow() {
		let editAddress = wx.getStorageSync('editAddress');
		
		if (editAddress) {
			that.changeAddres(editAddress);
		} else {
			// 获取地址列表
			that.getAddress();
		}

		let selectAddress = wx.getStorageSync('selectAddress');

		if (selectAddress) {
			that.setData({
				selectId: selectAddress.address_id
			});
		}
	},

	onReachBottom() {
		let current_page = that.data.current_page;
		let last_page = that.data.last_page;
		let next_page = current_page + 1;
		
		if (current_page < last_page) {
			that.getAddress(next_page);
		}
	},

	// 获取地址列表
	getAddress(page = 1) {
		let data = {
			openid: that.data.openid,
			page
		};

		app.request('Address/address_list', data, res => {
			if (res.code === 200) {

				if (page == 1) {
					let result = res.data;
					let addressList = result.data;

					that.setData({
						address_list: addressList,
						current_page: result.current_page,
						last_page: result.last_page
					});
				} else {
					let result = res.data;
					let addressList = that.data.address_list;
					let newAddressList = addressList.concat(result.data);

					that.setData({
						address_list: newAddressList,
						current_page: result.current_page,
						last_page: result.last_page
					});
				}

			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 改变地址
	changeAddres(editAddress) {
		let address_list = that.data.address_list;
		let address_idx = null;

		address_list.filter((el, idx) => {
			if (el.address_id == editAddress.address_id) {
				address_idx = idx;
			}
		});

		if (editAddress.handle == "edit") {
			delete editAddress.handle;

			if (editAddress.is_default == 1) {
				address_list.filter(el => {
					el.is_default = 0;
				});
			}

			address_list[address_idx] = editAddress;
		}

		if (editAddress.handle == "remove") {
			address_list.splice(address_idx, 1);
		}

		address_list.filter(el => {
			if (el.is_default == 1) {
				wx.setStorageSync("selectAddress", el);
			}
		});

		that.setData({
			address_list: address_list
		});

		wx.removeStorageSync('editAddress');
	},

	// 新增地址
	newAddress() {
		app.navigateTo("./newAddress");
	},

	// 编辑地址
	editAddress(e) {
		let addressList = that.data.address_list;
		let idx = e.currentTarget.dataset.idx;

		wx.setStorageSync('editAddress', addressList[idx]);

		app.navigateTo("./editAddress");
	},

	// 选中当前地址
	selectThis(e) {
		let address_list = that.data.address_list;
		let id = e.currentTarget.dataset.id;

		if (id != that.data.selectId) {
			that.setData({
				selectId: id
			});

			address_list.filter(el => {
				if (el.address_id == id) {
					wx.setStorageSync("selectAddress", el);
				}
			});
		}

		app.navigateBack(1);
	}

})