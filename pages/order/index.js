const app = getApp();
let that;

Page({

	data: {
		// openid：用户身份唯一标识符
		openid: null,
		// nav：订单分类
		nav: [
			{
				id: 0,
				text: '全部'
			},
			{
				id: 2,
				text: '待付款'
			},
			{
				id: 1,
				text: '待发货'
			},
			{
				id: 3,
				text: '待收货'
			}
		],
		// nowId：当前分类
		nowId: 0,
		// orderList：订单列表
		orderList: [],
		// current_page：当前页数
		current_page: 0,
		// last_page：最后一页
		last_page: 0
	},

	onLoad() {
		that = this;

		let openid = wx.getStorageSync('openid');

		if (openid) {
			that.setData({
				openid: openid
			});
		}

		// 获取订单列表
		that.getOrderList();
	},

	onShow() {
		let orderHandle = wx.getStorageSync('orderHandle');

		if (orderHandle) {
			that.changeDt(orderHandle);
		}
	},

	onReachBottom() {
		let current_page = that.data.current_page;
		let last_page = that.data.last_page;
		let next_page = current_page + 1;
		
		if (current_page < last_page) {
			that.getOrderList(next_page);
		}
	},

	// 获取订单列表
	getOrderList(page = 1) {
		let openid = that.data.openid;
		let status = that.data.nowId == 0 ? null : that.data.nowId;
		let data = {
			openid,
			status,
			page
		};

		app.request("order/order_list", data, res => {
			if (res.code === 200) {
				if (page == 1) {
					let result = res.data;

					that.setData({
						orderList: result.data,
						current_page: result.current_page,
						last_page: result.last_page
					});
				} else {
					let result = res.data;
					let orderList = that.data.orderList;
					let newOrderList = orderList.concat(result.data);

					that.setData({
						orderList: newOrderList,
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

	// 改变数据
	changeDt(orderHandle) {
		let orderList = that.data.orderList;
		let order_idx = null;

		orderList.filter((el, idx) => {
			if (el.id == orderHandle.orderHandleId) {
				order_idx = idx;
			}
		});

		if (orderHandle.handle == "cancel") {
			orderList[order_idx].status = 6;
		}

		if (orderHandle.handle == "pay") {
			orderList[order_idx].status = 1;
		}

		if (orderHandle.handle == "give") {
			orderList[order_idx].status = 4;
		}

		if (orderHandle.handle == "delete") {
			orderList.splice(order_idx, 1);
		}

		wx.removeStorageSync('orderHandle');

		that.setData({
			orderList: orderList
		});
	},

	// 切换分类
	changIndex(e){
		that.setData({
			nowId: e.target.dataset.id
		});

		// 获取订单列表
		that.getOrderList();
	},

	// 去订单详情
	toOrderInfo(e) {
		let orderId = e.currentTarget.dataset.orderId;

		app.navigateTo("/pages/order/orderInfo?orderId=" + orderId);
	},

	// 去物流详情
	toLogisticsIfon(e) {
		let orderId = e.currentTarget.dataset.orderId;
		
		app.navigateTo("/pages/order/logisticsIfon?orderId=" + orderId);
	},

	// 支付
	pay(e) {
		let openid = that.data.openid;
		let orderList = that.data.orderList;
		let order_id = e.currentTarget.dataset.orderId;
		let data = {
			openid,
			order_id
		};

		app.request('order/Payment', data, res => {
			if (res.code === 200) {
				let result = res.data;

				wx.requestPayment({
					timeStamp: result.timeStamp,
					nonceStr: result.nonceStr,
					package: result.package,
					signType: result.signType,
					paySign: result.paySign,
					success(res) {
						if (res.errMsg == "requestPayment:ok") {
							app.showToast("支付成功", "none");

							orderList.filter(el => {
								if (el.id == order_id) {
									orderInfo.status = 1;
								}
							});

							that.setData({
								orderList: orderList
							});
						}

					},
					fail(res) {
						if (res.errMsg == "requestPayment:fail cancel") {
							app.showToast("未完成支付", "none");
						}
					}
				});
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		})
	},

	// 取消
	cancel(e) {
		let openid = that.data.openid;
		let orderList = that.data.orderList;
		let order_id = e.currentTarget.dataset.orderId;
		let data = {
			openid,
			order_id
		};

		app.request("order/cancel", data, res => {
			if (res.code === 200) {
				orderList.filter(el => {
					if (el.id == order_id) {
						el.status = 6;
					}
				});

				that.setData({
					orderList: orderList
				});
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 收货
	give(e) {
		let openid = that.data.openid;
		let orderList = that.data.orderList;
		let order_id = e.currentTarget.dataset.orderId;
		let data = {
			openid,
			order_id
		};

		app.request("order/receipt", data, res => {
			if (res.code === 200) {
				orderList.filter(el => {
					if (el.id == order_id) {
						el.status = 4;
					}
				});

				that.setData({
					orderList: orderList
				});
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 删除
	delete(e) {
		let openid = that.data.openid;
		let orderList = that.data.orderList;
		let order_id = e.currentTarget.dataset.orderId;
		let data = {
			openid,
			order_id
		};
		let order_idx = null;

		orderList.filter((el, idx) => {
			if (el.id == order_id) {
				order_idx = idx;
			}
		});

		app.request("order/del_order", data, res => {
			if (res.code === 200) {
				orderList.splice(order_idx, 1);

				that.setData({
					orderList: orderList
				});
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	}

})