const app = getApp();
let that;

Page({

	/* 页面的初始数据*/
	data: {
		// openid：用户唯一id
		openid: null,
		// delShow：删除弹窗显隐
		delShow: false,
		// editAddress：编辑地址
		editAddress: '',
		// address_id：地址ID
		address_id: '',
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
		// switchChecked：设为默认地址按钮
		switchChecked: false
	},

	onLoad: function () {
		that = this;

		let openid = wx.getStorageSync('openid');

		let editAddress = wx.getStorageSync('editAddress');

		let addressArr = editAddress.address.split(' ');
		// 是否为默认地址
		let switchChecked = editAddress.is_default === 1 ? true : false;

		that.setData({
			openid: openid,
			editAddress: editAddress,
			address_id: editAddress.address_id,
			name: editAddress.name,
			mobile: editAddress.mobile,
			address: editAddress.address,
			addressArr: addressArr,
			gps_addr: editAddress.gps_addr,
			switchChecked: switchChecked
		});
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

	// 是否设为默认地址
	switchChange() {
		that.setData({
			switchChecked: !that.data.switchChecked
		});
	},

	// 所在地区
	bindAddressChange: function (e) {
		let address = e.detail.value

		that.setData({
			addressArr: e.detail.value,
			address: address.join(' ')
		});
	},

	// 保存编辑地址
	editAddress() {
		let localEditAddress = wx.getStorageSync('editAddress');
		let openid = that.data.openid;
		let editAddress = that.data.editAddress;
		let address_id = that.data.address_id;
		let name = that.data.name;
		let mobile = that.data.mobile;
		let address = that.data.address;
		let gps_addr = that.data.gps_addr;
		let is_default = that.data.switchChecked === true ? 1 : 0;

		if (editAddress.name == name && editAddress.mobile == mobile && editAddress.address == address && editAddress.gps_addr == gps_addr && editAddress.is_default == is_default) {
			app.showToast('请改变后再进行保存', 'none');

			return false;
		} else {
			if (!name) {
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
				address_id: address_id,
				is_default: is_default
			};

			app.request('Address/address_edit', data, res => {
				if (res.code === 200) {
					app.showToast(res.msg, 'none');

					localEditAddress.name = name;
					localEditAddress.mobile = mobile;
					localEditAddress.address = address;
					localEditAddress.gps_addr = gps_addr;
					localEditAddress.is_default = is_default;
					localEditAddress.handle = "edit";

					wx.setStorageSync('editAddress', localEditAddress);

					app.navigateBack(1);
				} else {
					app.showToast(res.msg, 'none');
				}
				
				app.hideLoading();
			});
		}
	},

	// 删除收货地址
	address_del() {
		let editAddress = wx.getStorageSync('editAddress');
		let address_id = that.data.address_id;

		let data = {
			address_id: address_id
		};

		app.request('Address/address_del', data, res => {
			if (res.code === 200) {
				app.showToast(res.msg, 'none');

				editAddress.handle = "remove";

				wx.setStorageSync('editAddress', editAddress);

				app.navigateBack(1);
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});

	},

	// 删除弹框显示
	openShow() {
		that.setData({
			delShow: true
		});
	},

	// 删除弹框隐藏
	closeShow() {
		that.setData({
			delShow: false
		});
	}

})