const app = getApp();
let that;
let innerAudioContext

Page({

	data: {
		selectMusicId: null,
		musicList: [],
	},

	onLoad(e) {
		that = this

		if (e.id != 'null') {
			that.setData({
				selectMusicId: Number(e.id)
			})
		}		
	},

	onShow() {
		// 音乐实列
		innerAudioContext = wx.createInnerAudioContext()

		let data
		app.request('Text/music', data, res => {

			if (res.code === 200) {
				let result = res.data.data;

				this.setData({
					musicList: result
				})

			} else {
				app.showToast(res.msg, 'none');
			}
			app.hideLoading();
		});

	},

	// 选择播放
	selectMusic(e) {

		let selectMusicSrc = e.currentTarget.dataset.name.thumb
		let selectMusicId = e.currentTarget.dataset.name.id

		this.playMusic(selectMusicSrc)

		this.setData({
			selectMusicId: selectMusicId
		})
	},

	// 没有音乐
	noneMusic() {

		this.playMusic('pause')

		this.setData({
			selectMusicId: null
		})
	},

	// 播放音乐
	playMusic(mode) {

		if (mode === 'pause') {

			innerAudioContext.pause()

		} else {
			innerAudioContext.src = mode

			innerAudioContext.play();

		}

	},

	// 完成选择
	finishSelect() {
		innerAudioContext.destroy()

		let selectMusicId = this.data.selectMusicId

		let pages = getCurrentPages()  //获取当前页面栈的信息
		let prevPage = pages[pages.length - 2]   //获取上一个页面
		prevPage.setData({   //把需要回传的值保存到上一个页面
			selectMusicId: selectMusicId
		});
		wx.navigateBack({   //然后返回上一个页面
			delta: 1
		})

	}
})