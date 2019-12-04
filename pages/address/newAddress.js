const app = getApp();
let that;

Page({

	/* 页面的初始数据 */
	data: {
		// openid：用户唯一id
		openid: null,
		// name：姓名
		name: '',
		// mobile：联系电话
		mobile: '',
		// addressArr：所在地区
		addressArr: [],
		// address：所在地区字符串
		address: '',
		// gps_addr：详细地址
		gps_addr: '',
		// switchChecked：是否为默认地址
		switchChecked: false
	},

	onLoad () {
		that = this;

		let openid = wx.getStorageSync('openid');

		if (openid) {
			that.setData({
				openid: openid
			});
		}
	},

	// 保存输入值
	saveInput(e) {
		let variable = e.currentTarget.dataset.variable;
		let inputText = (e.detail.value).trim();
		let reg=/^[1][3,4,5,7,8][0-9]{9}$/;

		if (inputText.length > 0) {
			if (variable == "mobile") {
				if (reg.test(inputText) && inputText.length == 11) {
					that.setData({
						[variable]: inputText
					});
				} else {
					app.showToast('请输入正确格式的11位手机号', 'none')
					that.setData({
						[variable]: ""
					});
				}
			} else {
				that.setData({
					[variable]: inputText
				});
			}
		}
	},

	// 所在地区
	bindAddressChange: function (e) {
		let address = e.detail.value;

		that.setData({
			addressArr: e.detail.value,
			address: address.join(' ')
		});
	},

	// 设为默认地址
	switchChange(){
		that.setData({
			switchChecked: !that.data.switchChecked
		});
	},

	// 保存新增地址
	saveNewAddress() {
		let openid = that.data.openid;
		let name = that.data.name;
		let mobile = that.data.mobile;
		let address = that.data.address;
		let gps_addr = that.data.gps_addr;
		let is_default = that.data.switchChecked === false ? 0 : 1;

		if (!openid) {
			app.showToast('您暂未登录，请登录后再进行操作', 'none');

			return false;
		} else if (!name) {
			app.showToast('请填写姓名', 'none');

			return false;
		} else if (!mobile) {
			app.showToast('请填写联系电话', 'none');

			return false;
		} else if (!address) {
			app.showToast('请填写所在地区', 'none');

			return false;
		} else if (!gps_addr) {
			app.showToast('请填写详细地址', 'none');

			return false;
		}

		let data = {
			openid: openid,
			name: name,
			mobile: mobile,
			address: address,
			gps_addr: gps_addr,
			is_default : is_default,
		};

		app.request('Address/address_add', data, res => {			
			if (res.code === 200) {
				app.showToast(res.msg, 'none');

				app.navigateBack(1);
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	}

})