const app = getApp();
let that;
let addressList;

Page({

	data: {
		// openid：用户身份唯一标识符
		openid: null,
		// address：地址信息
		address: "",
		// tmpDt：模板数据
		tmpDt: "",
		// ipt：备注
		ipt: "",
		// mid：材质id
		mid: "",
		// mtxt：材质文字
		mtxt: "",
		// zid：尺寸id
		zid: "",
		// ztxt：尺寸文字
		ztxt: "",
		// num：数量
		num: "",
		// price：总价
		price: "",
		// tid：模板id
		tid: "",
		// nowTime：当前日期
		nowTime: ""
	},

	onLoad(options) {
		that = this;

		let openid = wx.getStorageSync('openid');
		let mid = options.mid;
		let zid = options.zid;
		let num = options.num;
		let price = options.price;
		let tid = options.tid;

		let now = app.globalData.util.formYearMonthDay(new Date().getTime());

		that.setData({
			openid: openid,
			mid: mid,
			zid: zid,
			num: num,
			price: price,
			tid: tid,
			nowTime: now
		});
	},

	onShow() {
		let selectAddress = wx.getStorageSync('selectAddress');

		if (selectAddress) {
			that.setData({
				address: selectAddress
			});
		} else {
			// 获取默认地址
			that.getDefaultAddress();
		}

		// 获取模板数据
		that.getTmpDt();

		// 获取材质
		that.getMaterial();

		// 获取大小
		that.getSize();
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

									that.setData({
										address: el
									});
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

									that.setData({
										address: el
									});
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

	// 获取模板数据
	getTmpDt() {
		let data = {
			openid: that.data.openid,
			id: that.data.tid
		};

		app.request('text/t_detail', data, res => {
			if (res.code === 200) {
				let result = res.data;

				that.setData({
					tmpDt: result
				});
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 获取材质
	getMaterial() {
		app.request('text/material', {}, res => {
			if (res.code === 200) {
				let result = res.data;

				result.filter(el => {
					if (el.id == that.data.mid) {
						that.setData({
							mtxt: el.name
						});
					}
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

				result.filter(el => {
					if (el.id == that.data.zid) {
						that.setData({
							ztxt: el.name
						});
					}
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

	toAddress() {
		app.navigateTo("/pages/address/index?where=submit");
	},

	// 支付
	pay() {
		let openid = that.data.openid;
		let address = that.data.address;
		let mid = that.data.mid;
		let zid = that.data.zid;
		let num = that.data.num;
		let price = that.data.price;
		let tid = that.data.tid;
		let ipt = that.data.ipt;
		let data = {
			openid,
			mid,
			zid,
			address_id: address.address_id,
			num,
			price,
			tid,
			info: ipt
		};

		if (!address) {
			app.showToast("暂未选择收货地址", "none");

			return false;
		}

		app.request('order/order_create', data, res => {
			if(res.code === 200) {
				let result = res.data;

				wx.requestPayment({
					timeStamp: result.timeStamp,
					nonceStr: result.nonceStr,
					package: result.package,
					signType: result.signType,
					paySign: result.paySign,
					complete() {
						wx.setStorageSync("submit", true);

						wx.setStorageSync("orderId", result.order_id);

						app.switchTab('/pages/user/index');
					}
				});
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		})
	}

})