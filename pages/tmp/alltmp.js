const app = getApp();
let that;

Page({

	data: {
		// tmpList：模板列表
		tmpList: [],
		// current_page：当前页数
		current_page: null,
		// last_page：最后页数
		last_page: null,
		// tmpNum：模板数量
		tmpNum: null,
		// tmpTimes：循环几次
		tmpTimes: null
	},

	onLoad() {
		that = this;

		// 获取全部模板数据
		that.getTmpList();
	},

	onReachBottom() {
		let current_page = that.data.current_page;
		let last_page = that.data.last_page;
		let next_page = current_page + 1;

		if (current_page < last_page) {
			that.getTmpList(next_page);
		}
	},

	// 获取全部模板数据
	getTmpList(page = 1) {
		app.request('text/template', { page }, res => {
			if (res.code === 200) {

				if (page == 1) {
					let result = res.data;

					that.setData({
						tmpList: result.data,
						current_page: result.current_page,
						last_page: result.last_page,
						tmpNum: result.data.length,
						tmpTimes: parseInt(result.data.length / 3)
					});
				} else {
					let result = res.data;
					let tmpList = that.data.tmpList;
					let newTmpList = tmpList.concat(result.data);

					that.setData({
						tmpList: newTmpList,
						current_page: result.current_page,
						last_page: result.last_page,
						tmpNum: newTmpList.length,
						tmpTimes: parseInt(newTmpList.length / 3)
					});
				}

			} else {
				app.showToast(res.msg, 'none');
			}

			app.hideLoading();
		});
	},

	// 跳至选择模板
	select(e) {
		let id = e.currentTarget.dataset.id;
		app.navigateTo("/pages/tmp/tmplist?id=" + id);
	}

})