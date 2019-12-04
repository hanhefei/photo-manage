const app = getApp();
const util = app.globalData.util;
let that;

Page({

	data: {
		// 添加图片
		wareDescImg: [],
		// 输入框内容
		inputText: '',
	},

	onLoad() {
		that = this
	},

	// 保存输入框
	saveInput(e) {
		let text = e.detail.value

		that.setData({
			inputText: text
		});
	},

	// 上传图片
	updateImg() {
		let wareDescImg = that.data.wareDescImg;
		let num = 3 - wareDescImg.length;
		util.updateImg(num, (imgArr) => {
			imgArr.filter((element) => {
				wareDescImg.push(element);
			});

			that.setData({
				wareDescImg: wareDescImg
			});

			app.hideLoading();
		});
	},

	// 删除图片
	deleteThisImg(e) {
		let index = e.currentTarget.dataset.index;
		let wareDescImg = this.data.wareDescImg;

		wareDescImg.splice(index, 1);

		this.setData({
			wareDescImg: wareDescImg
		});
	},

	// 提交反馈
	Submission() {
		let openid = wx.getStorageSync("openid");
		let text = that.data.inputText;
		let images = that.data.wareDescImg;

		if (!openid) {
			app.showToast('您暂未登陆，请登录后再进行操作', 'none');

			return false;
		} else if (!text) {
			app.showToast('请输入您要反馈的问题', 'none');

			return false;
		}

		let data = {
			openid: openid,
			text: text,
			images: images
		};

		app.request('Address/feedback', data, res => {
			if (res.code === 200) {
				app.showToast("反馈已提交,即将返回个人中心", 'none');

				that.setData({
					inputText: '',
					wareDescImg: []
				});

				setTimeout(function(){
					app.reLaunch('./index');
				},1500);
			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});


	}
})