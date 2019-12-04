//index.js
import Card from '../../palette/card';
import ImgCompress from '../../template/compress/compress.js';

const app = getApp();
const util = app.globalData.util;
let that;

Page({
	data: {
		allColor: [
			'#ffffff', '#efefef', '#dddddd', '#cacaca', '#b6b6b6', '#9e9e9e', '#898989', '#717171', '#5b5758', '#3d3938', '#000000', '#ee857f', '#ea526b', '#cf7486', '#d59a9c', '#e50112', '#e60045', '#e50081', '#f6b7d2', '#cc7db4', '#b36b99', '#aa5e82', '#856071', '#b04185', '#a50083', '#7e479a', '#d4cbe6',
			'#a79bcd', '#796aaf', '#1d2089', '#526492', '#708dc9', '#0d83fb', '#02a0e9', '#51c1ff', '#a0d8f9', '#b7cddb', '#98aab6', '#567474', '#468a7d', '#009946', '#57a897', '#5ec2d1', '#52aab6', '#a7d4ad', '#99a99c', '#accd02', '#e0e20c', '#fffcde', '#fff57f', '#fff000', '#ffd001', '#ef8203', '#ef8436',
			'#f8ad3a', '#fcd7a2', '#8a7256', '#b59876', '#dab766', '#b6b49d',
		],
		// 操作导航栏
		actionBar: 'null',
		// 动画集
		animationData: {},

		// 模板ID
		mouldID: null,
		// 编辑模板ID
		editID: null,
		// 全部图片
		allImg: [],
		// 所有数据
		allData: {},
		// 全部页面
		allPicture: [],
		// 当前第几页
		nowPage: 0,
		// 当前选择index
		selectIndex: null,
		// 当前选择
		Selected: [],
		// 开始
		templateStart: null,
		// 结束
		templateEnd: null,
		// templateSubmit：是否提交
		templateSubmit: null,
		canWidth: null,
		canHeight: null,

		//大小、角度、亮度弹出层的状态
		hideModal: false,
		// 操作文字弹出层
		operationText: false,
		// 改变文字：
		changeText: false,

		// 全部贴纸
		AllSticker: [],
		// 当前选择贴纸
		selectSticker: [],
		// 贴纸弹出层的状态
		Sticker_Modal: false,
		// 显示全部贴纸
		Show_AllSticker: false,

		// 滑动条
		Sliderbar: '',
		// 放大倍数
		scaleValue: 1,
		// 旋转角度
		rotateValue: 0,
		// 图片亮度
		lightValue: 1,

		// 字体样式
		family: false,
		// 输入的文字
		inputText: '',
		// 字体颜色
		textColor: "#000000",
		// 所有字体样式
		allFontfamily: [],
		// 已选字体
		seletFontfamily: {},
		// 文字方向
		textDirection: "heng",
		// 显示推荐美文
		essay: false,
		essayList: [],
		// 显示颜色列表
		color: false,

		// 选择音乐ID
		selectMusicId: null,
		// 页面管理
		pageManage: false,
		// 当前页
		selectPage: null,
		MselectPage: null,
		// 编辑完成
		Finish_editing: false,
		// 替换页面
		pictureLocation: null,

		// 生成镜像、预览canvas宽高
		cvs_w: null,
		cvs_h: null,
		cvss: false,
		cvs: false,
		// 画布宽、高
		dragWidth: 0,
		dragHeight: 0,
		// 屏幕左边宽度
		// pageLeft: 0,
		// 触摸位置
		touchesX: null,
		touchesY: null,
		// 我的作品直接编辑
		bianji: null,
		// 还未登陆
		isLogin: false,
		// 字体页数
		nowFontPage: 1,
		allFontPage: 1,
	},

	onLoad(options) {
		that = this;

		this.imgCompress = new ImgCompress(this);

		let width = wx.getSystemInfoSync().screenWidth;	// 获取屏幕宽高
		let model = wx.getSystemInfoSync().model;

		if (model.search('iPhone X') > -1) {
			that.setData({
				dragWidth: width,
				dragHeight: width * 1.414286
			})
		} else {
			that.setData({
				dragWidth: width * 0.9,
				dragHeight: width * 0.9 * 1.414286
			})
		}

		let pages = getCurrentPages(); 	// 从哪里跳转过来
		let prevpage = pages[pages.length - 2];

		if (prevpage.route === "pages/tmp/tmplist" || prevpage.route === "pages/tmp/import_photo") {

			// 如果是从批量导入和单页添加
			let id = options.id;
			app.request('text/detail', { id: id }, res => {
				if (res.code === 200) {
					let result = res.data.text;

					if (wx.getStorageSync('allPicture')) {
						var allImg = JSON.parse(wx.getStorageSync('allPicture'));
					}

					that.setData({
						allData: res.data,
						allPicture: result,
						allImg: allImg,
						mouldID: id,
					})

					// 加载字体
					that.loadModuleFont(result)

					// 设置头部
					wx.setNavigationBarTitle({ title: res.data.name })

					that.downImg(result[0], 0, function (newDt) {
						let allPicture = that.data.allPicture;
						allPicture[0] = newDt;

						that.setData({
							allPicture: allPicture
						});
					});

					that.downImg(result[result.length - 1], 0, function (newDt) {
						let allPicture = that.data.allPicture;
						allPicture[allPicture.length - 1] = newDt;

						that.setData({
							allPicture: allPicture
						});
					});

					// 如果是批量导入，更改批量导入图片
					if (allImg.length != 0) {

						let allNum = 0, ImgInedx = 0;

						function allCallFn(allNum) {

							if (allNum != result.length) {

								let num = 0
								let data_arr = result[allNum];

								function callFn(num) {
									if (num != data_arr.length && ImgInedx != allImg.length) {

										if (data_arr[num].type === 'frame') {

											data_arr[num].url = allImg[ImgInedx].url;

											let width = allImg[ImgInedx].weight / that.data.dragWidth;
											let height = allImg[ImgInedx].height / that.data.dragHeight;

											let imgWidth, imgHeight;

											if (allImg[ImgInedx].weight > allImg[ImgInedx].height) {
												imgHeight = data_arr[num].height;
												let widthbili = imgHeight / height;
												imgWidth = width * widthbili;
											} else {
												imgWidth = data_arr[num].width;
												let widthbili = imgWidth / width;
												imgHeight = height * widthbili;
											}

											data_arr[num].imgWidth = imgWidth;
											data_arr[num].imgHeight = imgHeight;
											data_arr[num].left = 0;
											data_arr[num].top = 0;

											num += 1;
											ImgInedx += 1;
											callFn(num);
										} else {
											num += 1;
											callFn(num);
										}
									} else {
										result[allNum] = data_arr;
										allNum += 1;
										allCallFn(allNum);
									}
								}
								callFn(num);
							} else {
								that.setData({
									allPicture: result
								})
							}
						}
						allCallFn(allNum)
					}
				} else {
					app.showToast(res.msg, 'none');
				}
				app.hideLoading();
			});

		} else {

			let bianji = options.bianji;
			if (bianji) {
				that.setData({ bianji: true })
			}

			let id = options.goodsId;
			let openid = wx.getStorageSync('openid');

			let data = {
				openid: openid,
				id: id
			}

			app.request('text/t_detail', data, res => {
				if (res.code === 200) {
					let result = res.data;

					that.setData({
						allData: result,
						selectMusicId: result.music_id,
						allPicture: result.text,
						mouldID: result.t_id,
						editID: result.id,
					});

					// 加载字体
					that.loadModuleFont(result.text)

					// 设置头部
					wx.setNavigationBarTitle({ title: result.name })

					that.downImg(result.text[0], 0, function (newDt) {
						let allPicture = that.data.allPicture;
						allPicture[0] = newDt;

						that.setData({
							allPicture: allPicture
						});
					});

					that.downImg(result.text[result.text.length - 1], 0, function (newDt) {
						let allPicture = that.data.allPicture;
						allPicture[allPicture.length - 1] = newDt;

						that.setData({
							allPicture: allPicture
						});
					});

				} else {
					app.showToast(res.msg, 'none');
				}
				app.hideLoading();
			});
		}
	},

	// 加载字体
	loadModuleFont(allData) {

		let allNum = 0, num = 0, alltext = []

		function allList(allNum) {
			if (allNum != allData.length) {
				let nowData = allData[allNum];
				function nowList(num) {
					if (num != nowData.length) {
						if (nowData[num].type === 'text') {
							alltext.push(nowData[num])
						}
						num += 1
						nowList(num)
					} else {
						allNum += 1;
						allList(allNum)
					}
				}
				nowList(num)
			} else {

				let num = 0
				function loadFond(num) {
					if (num != alltext.length) {
						if (alltext[num].familyUrl) {
							wx.loadFontFace({
								family: alltext[num].family,
								source: `url('${alltext[num].familyUrl}')`,
								success() {
									num += 1;
									loadFond(num)
								},
								fail() {
									num += 1;
									loadFond(num)
								}
							})
						} else {
							num += 1;
							loadFond(num)
						}
					}
				}
				loadFond(num)
			}
		}
		allList(allNum)
	},

	onShow() {

		// 获取屏幕偏移量
		// const query = wx.createSelectorQuery()
		// query.select('#canvas-drag').boundingClientRect()
		// query.selectViewport().scrollOffset()
		// query.exec(function (res) {
		// 	that.setData({
		// 		pageLeft: res[0].left
		// 	})
		// });

		// 接收音乐ID
		let pages = getCurrentPages();
		let currPage = pages[pages.length - 1]; //当前页面
		let selectMusicId = currPage.data.selectMusicId
		if (selectMusicId) {
			that.setData({
				selectMusicId: selectMusicId,
			})
		};
	},

	async downImg(dt, num, callback) {
		let newDt = dt;

		if (dt[num].url) {
			await wx.downloadFile({
				url: dt[num].url,
				success(res) {
					that.imgCompress.compress(res.tempFilePath, 1, 1).then(res => {
						newDt[num].downUrl = res.compress.path;

						if (num == dt.length - 1) {
							callback(newDt);
						} else {
							num += 1;
							that.downImg(dt, num, callback);
						}
					}).catch(e => {
						that.downImg(dt, num, callback);
					});
				}
			});
		} else {
			if (num == dt.length - 1) {
				callback(newDt);
			} else {
				num += 1;
				that.downImg(dt, num, callback);
			}
		}
	},

	//  完成 图片/贴纸 编辑确认
	finish_operationPic() {
		that.setData({
			actionBar: 'null',
			selectIndex: null,
			Selected: [],
			changeText: false,
			operationText: false,
			family: false,
		})
		that.hideModal();
	},

	// 触摸开始
	touchstart(e) {
		let Selected = e.currentTarget.dataset.name;

		if (Selected.type === 'frame') {
			that.setData({
				actionBar: 'frame',
			})
		} else if (Selected.type === 'paster') {
			that.setData({
				actionBar: 'sticker',
				changeText: false
			})
		} else if (Selected.type === 'text') {
			that.setData({
				actionBar: 'sticker',
				changeText: true,
			})
		}

		that.setData({
			selectIndex: e.currentTarget.dataset.index,
			Selected: Selected,
			touchesX: e.touches[0].clientX,
			touchesY: e.touches[0].clientY,
		})
	},
	// 触摸移动
	touchmove(e) {

		let allPicture = that.data.allPicture;
		let nowPage = that.data.nowPage;
		let selectIndex = that.data.selectIndex;
		let Selected = that.data.Selected;

		let x = (e.touches[0].clientX - that.data.touchesX) / that.data.dragWidth + Number(Selected.x);
		let y = (e.touches[0].clientY - that.data.touchesY) / that.data.dragHeight + Number(Selected.y);

		allPicture[nowPage][selectIndex].x = x
		allPicture[nowPage][selectIndex].y = y

		that.setData({
			allPicture: allPicture,
		})
	},

	// 图片触摸开始
	touchImageStart(e) {
		that.setData({
			touchesX: e.touches[0].clientX,
			touchesY: e.touches[0].clientY,
		})
	},

	// 图片触摸开始移动
	touchImageMove(e) {

		let allPicture = that.data.allPicture;
		let nowPage = that.data.nowPage;
		let selectIndex = that.data.selectIndex;
		let Selected = that.data.Selected;

		let leftM = (e.touches[0].clientX - that.data.touchesX) / that.data.dragWidth + Selected.left;
		let topM = (e.touches[0].clientY - that.data.touchesY) / that.data.dragHeight + Selected.top;

		allPicture[nowPage][selectIndex].left = leftM;
		allPicture[nowPage][selectIndex].top = topM;

		that.setData({
			allPicture: allPicture
		})
	},

	// 开始拖拽缩放
	startScale(e) {
		let Selected = e.currentTarget.dataset.name;

		if (Selected.type === 'frame') {
			that.setData({
				actionBar: 'frame',
			})
		} else {
			that.setData({
				actionBar: 'sticker',
			})
		}
		that.setData({
			selectIndex: e.currentTarget.dataset.index,
			Selected: Selected,
			touchesX: e.touches[0].clientX,
			touchesY: e.touches[0].clientY,
		})
	},

	// 拖拽缩放
	moveScale(e) {
		let allPicture = that.data.allPicture;
		let nowPage = that.data.nowPage;
		let selectIndex = that.data.selectIndex;
		let Selected = that.data.Selected;
		// let pageLeft = that.data.pageLeft;

		// 获取当前选择的中心点位置
		let centX = (Number(Selected.x) + Selected.width / 2) * that.data.dragWidth;
		let centY = (Number(Selected.y) + Selected.height / 2) * that.data.dragHeight;

		let pageX = e.touches[0].pageX;
		let pageY = e.touches[0].pageY;

		let angleX = pageX - centX;
		let angleY = pageY - centY;
		// 计算角度
		let angle = (Math.atan2(angleY, angleX) / Math.PI) * 180;

		// 计算宽度/高度
		const lineA = Math.sqrt(Math.pow((centX - that.data.touchesX), 2) + Math.pow((centY - that.data.touchesY), 2));
		const lineB = Math.sqrt(Math.pow((centX - e.touches[0].clientX), 2) + Math.pow((centY - e.touches[0].clientY), 2));
		const w = Number(Selected.width) + (lineB - lineA) / that.data.dragWidth;

		let bili = w / Selected.width;
		let h = Selected.height * bili;

		if (Selected.type === "paster") {
			allPicture[nowPage][selectIndex].width = w;
			allPicture[nowPage][selectIndex].height = h;
			allPicture[nowPage][selectIndex].rotate = angle;
		} else if (Selected.type === "text") {
			if (Selected.sort === "heng") {
				allPicture[nowPage][selectIndex].width = w;
				allPicture[nowPage][selectIndex].rotate = angle;
				// allPicture[nowPage][selectIndex].height = h;
			} else if (Selected.sort === "shu") {
				allPicture[nowPage][selectIndex].rotate = angle;
				allPicture[nowPage][selectIndex].width = w;
				allPicture[nowPage][selectIndex].height = h;
			}
		}

		that.setData({
			allPicture: allPicture
		});
	},

	// 删除 图片、贴纸
	del_operationPic() {

		let allPicture = that.data.allPicture;
		let nowPage = that.data.nowPage;
		let selectIndex = that.data.selectIndex;

		if (allPicture[nowPage][selectIndex].type == 'frame') {
			delete allPicture[nowPage][selectIndex].url
		} else {
			allPicture[nowPage].splice(selectIndex, 1)
		}

		that.setData({
			allPicture: allPicture,
		})
	},

	// 镜像
	mirImage() {
		app.showLoading('镜像生成中', 'none');

		let allPicture = that.data.allPicture;
		let nowPage = that.data.nowPage;
		let num = that.data.selectIndex;
		let data_arr = allPicture[nowPage];

		let width = data_arr[num].width * that.data.dragWidth;
		let height = data_arr[num].height * that.data.dragHeight;

		that.setData({
			cvss: true,
			cvs_w: width,
			cvs_h: height
		})

		const ctx = wx.createCanvasContext('myJingXiangCanvas');

		let url = data_arr[num].url;

		if (!url || url.length === 0) {
			app.showToast('请上传图片后再进行操作', 'none');
			setTimeout(function () { app.hideLoading(); }, 300)
			return false
		}

		wx.getImageInfo({
			src: url,
			success: function (res) {
				let path = res.path;

				ctx.save();
				ctx.transform(-1, 0, 0, 1, 0, 0);
				ctx.drawImage(path, -width, 0, width, height);
				ctx.restore();

				ctx.draw(false, () => {
					wx.canvasToTempFilePath({
						x: 0,
						y: 0,
						width: width,
						height: height,
						canvasId: 'myJingXiangCanvas',
						success(res) {
							let url = res.tempFilePath;

							wx.uploadFile({
								url: 'https://yyxc.top/api/Upload/upload',
								filePath: url,
								name: 'file',
								success(res) {
									let filurl = JSON.parse(res.data).url;
									allPicture[nowPage][num].url = filurl

									that.setData({
										allPicture: allPicture,
										cvss: false
									});
								},
								complete() {
									app.hideLoading();
								}
							})
						}
					})
				});
			}
		});
	},
	ture() { },

	// 下一页按钮
	nextPage() {
		let nowPage = that.data.nowPage;
		let allPicture = that.data.allPicture;

		if (nowPage < that.data.allPicture.length - 1) {
			nowPage += 1
			that.setData({ nowPage: nowPage, })

			let title = nowPage + 1 + '/' + (allPicture.length)  	// 标题栏
			wx.setNavigationBarTitle({ title: title })
		}
	},

	// 上一页按钮
	prvPic() {
		let nowPage = that.data.nowPage;
		let allPicture = that.data.allPicture;

		if (nowPage > 0) {
			nowPage -= 1
			that.setData({ nowPage: nowPage, })

			let title = nowPage + 1 + '/' + (allPicture.length)  	// 标题栏
			wx.setNavigationBarTitle({ title: title })
		}
	},

	// 显示滑动条弹出层
	showModal(e) {
		let Sliderbar = e.currentTarget.dataset.name;
		let Selected = that.data.Selected;

		let allPicture = that.data.allPicture;
		let nowPage = that.data.nowPage;
		let selectIndex = that.data.selectIndex;

		Selected = JSON.parse(JSON.stringify(allPicture[nowPage][selectIndex]));

		let brightness = Selected.brightness;
		let rotate = parseInt(Selected.rotate);

		// 显示滑动条
		if (Sliderbar === "scale") {
			that.setData({
				Sliderbar: 'scale',
			})
		} else if (Sliderbar === "rotate") {
			that.setData({
				Sliderbar: 'rotate',
				rotateValue: rotate
			})
		} else if (Sliderbar === "light") {
			that.setData({
				Sliderbar: 'light',
				lightValue: brightness
			})
		}

		that.setData({
			hideModal: true,
			Selected: Selected
		})

		let animation = wx.createAnimation({
			duration: 500,//动画的持续时间
			timingFunction: 'ease',//动画的效果
		})
		this.animation = animation
		that.fadeIn();//调用显示动画
	},

	// 滑动条
	Sliderbar(e) {

		let SliderValue = Math.round(e.detail.value * 100) / 100;
		let SliderName = e.currentTarget.dataset.name;

		let allPicture = that.data.allPicture;
		let nowPage = that.data.nowPage;
		let index = that.data.selectIndex;
		let Selected = that.data.Selected;

		if (SliderName === 'scale') {
			if (Selected.type === 'text') {
				if (Selected.content.length === 0) {
					app.showToast("请输入文字后操作", "none");
					return false;
				}

				let fontSize = Selected.fontSize, width = Selected.width, height = Selected.height;

				allPicture[nowPage][index].fontSize = fontSize * SliderValue;
				allPicture[nowPage][index].width = width * SliderValue;
				allPicture[nowPage][index].height = height * SliderValue;

				that.setData({
					allPicture: allPicture,
					scaleValue: SliderValue
				});
			} else {

				if (Selected.type !== 'frame') {
					// 获取选中贴纸原始宽高
					let width = Selected.width, height = Selected.height;
					allPicture[nowPage][index].width = width * SliderValue;
					allPicture[nowPage][index].height = height * SliderValue;
				} else {
					// 获取选中图片原始宽高
					let imgWidth = Selected.imgWidth, imgHeight = Selected.imgHeight;
					allPicture[nowPage][index].imgWidth = imgWidth * SliderValue;
					allPicture[nowPage][index].imgHeight = imgHeight * SliderValue;

					// 改变left top
					let left = Selected.left, top = Selected.top;
					allPicture[nowPage][index].left = left * SliderValue;
					allPicture[nowPage][index].top = top * SliderValue;
				}

				that.setData({
					allPicture: allPicture,
					scaleValue: SliderValue
				})
			}
		} else if (SliderName === 'rotate') {
			allPicture[nowPage][index].rotate = SliderValue;	// 改变图片旋转角度
			that.setData({
				allPicture: allPicture,
				rotateValue: SliderValue
			})

		} else if (SliderName === 'light') {
			allPicture[nowPage][index].brightness = SliderValue;	// 改变图片亮度
			that.setData({
				allPicture: allPicture,
				lightValue: SliderValue
			})
		}
	},

	// 隐藏滑动条弹出层
	hideModal() {
		let animation = wx.createAnimation({
			duration: 500,//动画的持续时间
			timingFunction: 'ease',//动画的效果
		})
		that.animation = animation
		that.fadeDown();//调用隐藏动画
		setTimeout(function () {
			that.setData({
				hideModal: false,
				scaleValue: 1,
				rotateValue: 0,
				lightValue: 1,
				Sliderbar: '',
			})
		}, 500)//先执行下滑动画，再隐藏模块
	},

	// 上传图片
	upImg() {
		that.onAddImage()
	},

	//更换图片
	onAddImage() {
		let allPicture = that.data.allPicture;
		let nowPage = that.data.nowPage;
		let index = that.data.selectIndex;
		let dragHeight = that.data.dragHeight;
		let dragWidth = that.data.dragWidth

		let num = 1;
		util.updateImg(num, (imgArr) => {

			app.showLoading('图片上传中', 'none');
			let url = imgArr[0].url;
			allPicture[nowPage][index].url = url;

			let imgWidth, imgHeight;

			if (imgArr[0].height > imgArr[0].weight) {

				imgWidth = allPicture[nowPage][index].width * dragWidth;
				let widthbili = imgWidth / imgArr[0].weight * 2;
				imgHeight = imgArr[0].height * widthbili / 2;
			} else {

				imgHeight = allPicture[nowPage][index].height * dragHeight;
				let widthbili = imgHeight / imgArr[0].height * 2;
				imgWidth = imgArr[0].weight * widthbili / 2;
			}

			allPicture[nowPage][index].imgWidth = imgWidth / dragWidth;
			allPicture[nowPage][index].imgHeight = imgHeight / dragHeight;
			allPicture[nowPage][index].left = 0;
			allPicture[nowPage][index].top = 0;

			that.setData({
				allPicture: allPicture,
			})

			setTimeout(function () {
				app.hideLoading();
			}, 1000)
		});
	},

	// 弹出添加文字
	Show_operationText(e) {
		let Selected = that.data.Selected;
		let changeText = that.data.changeText;

		if (changeText) {
			that.setData({
				inputText: Selected.content,
				textColor: Selected.color,
				textDirection: Selected.sort,
			})
		} else {
			that.setData({
				inputText: '',
				textColor: '#000000',
				textDirection: 'heng',
			})
		}

		that.setData({
			operationText: true,
		})

		let animation = wx.createAnimation({
			duration: 500,//动画的持续时间
			timingFunction: 'ease',//动画的效果 默认值是linear
		})
		this.animation = animation
		that.fadeIn();//调用显示动画
	},

	// 输入文字
	inputText(e) {
		that.setData({ inputText: e.detail.value })
	},
	// 文字颜色
	changeColor() {
		that.setData({ color: true })
	},
	// 选择颜色
	Color(e) {
		that.setData({
			textColor: e.currentTarget.dataset.name,
			color: false
		})
	},
	// 文字方向
	textDirection(e) {
		let Direction = e.currentTarget.dataset.name;
		that.setData({ textDirection: Direction })
	},

	// 加载字体
	loadFont() {
		let Fontfamily = [];
		let allFontfamily = that.data.allFontfamily;
		let nowFontPage = that.data.nowFontPage;
		let allFontPage = that.data.allFontPage;

		if (nowFontPage > allFontPage) {
			app.showToast('已加载所有字体', 'none');
			return false
		}

		app.request('text/font', { page: nowFontPage }, res => {
			if (res.code === 200) {
				let result = res.data.data
				let allMum = result.length;
				let num = 0

				that.setData({
					allFontPage: res.data.last_page,
					nowFontPage: nowFontPage + 1
				})

				function loadFond(num) {
					if (num != allMum) {
						wx.loadFontFace({
							family: result[num].name,
							source: `url(${result[num].thumb})`,
							success() {
								Fontfamily.push(result[num])
								that.setData({
									allFontfamily: [...allFontfamily, ...Fontfamily]
								})
								num += 1;
								loadFond(num)
							},
							fail() {
								num += 1;
								loadFond(num)
							}
						})
					} else {
						app.hideLoading()
					}
				}
				loadFond(num)
			} else {
				app.showToast(res.msg, 'none');
			}
		});
	},

	// 打开选择字体
	Fontfamily() {
		// 加载字体
		that.loadFont()
		that.setData({
			family: true,
		})
	},
	// 改变字体
	changeFontFamily(e) {
		that.setData({
			family: false,
			nowFontPage: 1,
			allFontfamily: [],
			seletFontfamily: e.currentTarget.dataset.name,
		})
	},
	// 关闭选择字体
	Close_operationfamily() {
		that.setData({
			family: false,
			allFontfamily: [],
			nowFontPage: 1,
		})
	},
	// 打开推荐美文
	changeEssay() {
		let id = that.data.mouldID

		app.request('text/text', { id: id }, res => {
			if (res.code == 200) {

				that.setData({
					essayList: res.data,
					essay: true,
				})
			} else if (res.code == 401) {
				app.showToast('暂未添加推荐美文', 'none');
			} else {
				app.showToast(res.msg, 'none');
			}
			app.hideLoading();
		});
	},
	// 换一换推荐美文
	changeMoreEssay() {
		that.changeEssay()
	},
	// 选择推荐美文
	Essay(e) {
		let inputText = e.currentTarget.dataset.name;
		that.setData({
			essay: false,
			inputText: inputText
		})
	},
	// 完成添加文字
	Finish_operationText() {
		let allPicture = that.data.allPicture;
		let nowPage = that.data.nowPage;
		let selectIndex = that.data.selectIndex;
		let seletFontfamily = that.data.seletFontfamily;

		let inputText = that.data.inputText;
		let textColor = that.data.textColor;
		let fontSize = 20 / that.data.dragWidth;
		let textDirection = that.data.textDirection;
		let num = allPicture[nowPage].length;
		let Fontfamily = seletFontfamily.name;
		let familyId = seletFontfamily.id;
		let familyUrl = seletFontfamily.thumb;

		if (inputText.length === 0) {
			app.showToast("请输入你要添加的文字", "none");
			return false;
		}
		// 判断是新增还是编辑
		let changeText = that.data.changeText;
		if (!changeText) {

			let width, height;
			if (textDirection === "heng") {
				width = inputText.length > 8 ? 8 * fontSize : inputText.length * fontSize;
				height = inputText.length > 8 ? parseInt(inputText.length / 8) * fontSize : fontSize;
			} else if (textDirection === "shu") {
				height = inputText.length > 5 ? 5 * fontSize : inputText.length * fontSize;
				width = inputText.length > 5 ? parseInt(inputText.length / 5) * 2 * fontSize : fontSize;
			}

			let data = {
				color: textColor,
				content: inputText,
				family: Fontfamily,
				familyId: familyId,
				familyUrl: familyUrl,
				fontSize: fontSize,
				height: height,
				num: num,
				rotate: "0",
				sort: textDirection,
				type: "text",
				width: width,
				x: ".5",
				y: ".5"
			};

			allPicture[nowPage].push(data);
		} else {

			let fontSize = allPicture[nowPage][selectIndex].fontSize;
			let content = allPicture[nowPage][selectIndex].content;
			let sort = allPicture[nowPage][selectIndex].sort;

			if (content.length != inputText.length || sort != textDirection) {

				let width, height;
				if (textDirection === "heng") {
					width = inputText.length > 8 ? 8 * fontSize : inputText.length * fontSize;
					height = inputText.length > 8 ? parseInt(inputText.length / 8) * fontSize : fontSize;
				} else if (textDirection === "shu") {
					height = inputText.length > 5 ? 5 * fontSize : inputText.length * fontSize;
					width = inputText.length > 5 ? parseInt(inputText.length / 5) * fontSize : fontSize;
				}

				allPicture[nowPage][selectIndex].height = height;
				allPicture[nowPage][selectIndex].width = width;
			}

			allPicture[nowPage][selectIndex].color = textColor;
			allPicture[nowPage][selectIndex].content = inputText;
			allPicture[nowPage][selectIndex].family = Fontfamily;
			allPicture[nowPage][selectIndex].familyId = familyId;
			allPicture[nowPage][selectIndex].familyUrl = familyUrl;
			allPicture[nowPage][selectIndex].sort = textDirection;
		}

		that.fadeDown(); //调用隐藏动画
		setTimeout(function () {
			that.setData({
				family: false,
				operationText: false,
				allPicture: allPicture,
			});
		}, 500); //先执行下滑动画，再隐藏模块
	},

	// 隐藏添加文字
	Close_operationText(e) {
		let change = e.currentTarget.dataset.name;

		if (change === 'close') {
			that.fadeDown();//调用隐藏动画   
			setTimeout(function () {
				that.setData({
					operationText: false,
				})
			}, 500)//先执行下滑动画，再隐藏模块

		} else if (change === 'closeChangeEssay') {
			that.setData({
				essay: false,
				color: false,
			})
		}
	},

	//动画集
	fadeIn: function () {
		that.animation.translateY(0).step()
		that.setData({
			animationData: that.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
		})
	},
	fadeDown: function () {
		that.animation.translateY(300).step()
		that.setData({
			animationData: that.animation.export(),
		})
	},

	// 打开贴纸弹出层
	Show_Sticker() {

		that.setData({
			Sticker_Modal: true,
		})
		// 加载贴纸
		that.load_Sticker()

		let animation = wx.createAnimation({
			duration: 500,//动画的持续时间
			timingFunction: 'ease',//动画的效果
		})
		that.animation = animation
		that.fadeIn();//调用显示动画
	},

	// 加载贴纸
	load_Sticker() {
		let id = that.data.mouldID;

		app.request('text/t_sticker', { id: id }, res => {

			if (res.code === 200) {
				let result = res.data;
				that.setData({
					AllSticker: result,
				})
			} else {
				app.showToast(res.msg, 'none');
			}
			app.hideLoading();
		});
	},

	// 打开全部贴纸
	open_AllSticker() {
		that.setData({ Show_AllSticker: true })
	},

	// 全部贴纸选择
	changeSticker(e) {
		that.setData({ selectSticker: e.currentTarget.dataset.name })
	},

	// 完成贴纸选择
	finish_Sticker(e) {

		let nowPage = that.data.nowPage
		let allPicture = that.data.allPicture

		// 弹出层选择贴纸
		if (e.currentTarget.dataset.name) {
			that.setData({
				selectSticker: e.currentTarget.dataset.name
			})
		}

		let selectSticker = that.data.selectSticker;
		if (selectSticker.length == 0) {
			app.showToast('你没有选择任何贴纸', 'none')
			return false
		}

		let url = selectSticker.thumb;
		let name = selectSticker.name;
		let width = selectSticker.width / (that.data.dragWidth * 4);
		let height = selectSticker.height / (that.data.dragHeight * 4);
		let num = allPicture[nowPage].length;

		let data = {
			brightness: "1",
			height: height,
			name: name,
			num: num,
			rotate: "0",
			type: "paster",
			url: url,
			urlType: "data",
			width: width,
			x: ".3",
			y: ".3",
			y_url: url,
		}

		allPicture[nowPage].push(data)

		that.setData({
			allPicture: allPicture
		})

		// 先隐藏贴纸弹出层，再打开全部贴纸
		let animation = wx.createAnimation({
			duration: 500,//动画的持续时间
			timingFunction: 'ease',//动画的效果
		})
		that.animation = animation
		that.fadeDown();//调用隐藏动画  

		that.setData({
			AllSticker: [],
			Show_AllSticker: false,
			Sticker_Modal: false,
			selectSticker: []
		});
	},

	// 关闭全部贴纸
	close_Sticker() {
		that.setData({
			AllSticker: [],
			Show_AllSticker: false,
			Sticker_Modal: false,
		});
	},

	// 隐藏全部贴纸弹出层
	Close_Sticker(e) {
		let animation = wx.createAnimation({
			duration: 500,//动画的持续时间
			timingFunction: 'ease',//动画的效果
		})
		that.animation = animation;
		that.fadeDown();//调用隐藏动画   
		setTimeout(function () {
			that.setData({
				Sticker_Modal: false,
				AllSticker: []
			})
		}, 500)//先执行下滑动画，再隐藏模块
	},

	// 跳转至音乐页面
	toMusic() {
		let id = that.data.selectMusicId;

		wx.navigateTo({ url: "./music?id=" + id })
	},

	// 打开页面管理
	toPageManage() {

		that.setData({ pageManage: true })

		that.getImgSite()
	},
	// 获取图片位置
	getImgSite() {

		let pictureLocation = [];
		const query = wx.createSelectorQuery();
		query.selectAll('.everyPage').boundingClientRect();
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
	// 清除替换页面选择
	cleanSelectImg() {
		that.setData({
			selectPage: null
		})
	},
	// 替换页面选择
	selectPage(e) {
		that.setData({
			selectPage: e.currentTarget.dataset.name
		})
	},
	// 管理页面开始移动
	managetouchstart(e) {
		that.setData({
			MselectPage: e.currentTarget.dataset.name
		})
	},
	// 管理页面结束
	mangeend(e) {
		let pictureLocation = that.data.pictureLocation;
		let selectImgId = that.data.MselectPage;
		let allPicture = that.data.allPicture
		let befor = null;
		let after = null;

		pictureLocation.map((el, idx) => {
			if (e.changedTouches[0].pageX >= el.left && e.changedTouches[0].pageX <= (el.left + el.width) && e.changedTouches[0].pageY >= el.top && e.changedTouches[0].pageY <= (el.top + el.height)) {

				befor = JSON.stringify(allPicture[selectImgId]);
				after = JSON.stringify(allPicture[idx]);

				allPicture[selectImgId] = JSON.parse(after)
				allPicture[idx] = JSON.parse(befor)
			}
		});

		that.setData({
			allPicture: allPicture,
		});
	},

	// 完成替换页面
	finishChangePage() {
		// 替换页面数据
		let allPicture = that.data.allPicture;
		let selectPage = that.data.selectPage;
		let nowPage = that.data.nowPage;

		let finish = JSON.stringify(allPicture[selectPage]);

		// 替换数据
		allPicture[nowPage] = JSON.parse(finish)

		that.setData({
			selectPage: null,
			pageManage: false,
			allPicture: allPicture,
		})
	},

	// 关闭替换页面
	closeChangePage() {
		that.setData({
			pageManage: false,
			selectPage: null
		})
	},

	// 暂存
	temporary() {
		let openid = wx.getStorageSync('openid');

		if (!openid) {
			that.setData({
				isLogin: true
			});
		} else {
			let finish = 'temporary'
			that.Temporary_storage(finish)
		}
	},

	// 通过按钮形式获取用户授权
	getUserInfo(e) {
		if (e.detail.userInfo) {
			let userInfo = e.detail.userInfo;

			// 微信登录
			app.login(() => {
				that.wxAithorize(userInfo);
			});
		}
	},

	// 微信登录
	wxAithorize(userInfo) {
		let code = wx.getStorageSync('code');

		let data = {
			code: code,
			username: userInfo.nickName,
			headimg: userInfo.avatarUrl
		};

		app.request('Login/Login', data, res => {
			if (res.code === 200) {
				let result = res.data;

				let userInfo = {
					user_id: result.user_id,
					openid: result.openid,
					username: result.username,
					headimg: result.headimg,
				};

				wx.removeStorageSync('code');
				wx.setStorageSync('userInfo', userInfo);
				wx.setStorageSync('openid', result.openid);
				// 执行暂存
				let finish = 'temporary'
				that.Temporary_storage(finish)

				that.setData({
					isLogin: false
				});
			} else {
				app.showToast(res.msg, 'none');
			}
			app.hideLoading();
		});
	},

	onImgOK1(e) {
		that.imagePathStart = e.detail.path;
	},

	onImgOK2(e) {
		that.imagePathEnd = e.detail.path;
	},

	onImgOK3(e) {
		that.imagePathEnd = e.detail.path;
	},

	// 暂存 完成
	Temporary_storage(allFinish) {
		app.showLoading('数据保存中', 'none');

		that.setData({
			templateSubmit: true
		});

		let run = null;
		let run1 = null;
		let run2 = null;
		let run3 = null;
		let allPicture = that.data.allPicture;

		let allData = that.data.allData;
		let music_id = that.data.selectMusicId;
		let nowPage = that.data.nowPage;
		let id = allData.id;
		let Preview = [];

		async function savePrev() {

			async function downDt(dt, i, callback) {
				let newDt = dt;

				if (dt[i].url) {
					if (!dt[i].downUrl) {
						await wx.downloadFile({
							url: dt[i].url,
							success(res) {

								that.imgCompress.compress(res.tempFilePath, 1, 1).then(res => {
									newDt[i].downUrl = res.compress.path;
									// newDt[i].downUrl = res.tempFilePath;

									if (i == dt.length - 1) {
										callback(newDt);
									} else {
										i += 1;
										downDt(dt, i, callback);
									}
								}).catch(e => {
									downDt(dt, i, callback);
								});

							}
						});
					} else {
						if (i == dt.length - 1) {
							callback(newDt);
						} else {
							i += 1;
							downDt(dt, i, callback);
						}
					}
				} else {
					if (i == dt.length - 1) {
						callback(newDt);
					} else {
						i += 1;
						downDt(dt, i, callback);
					}
				}

			}

			let startDt = null;
			let endDt = null;

			await downDt(allPicture[0], 0, function (newDt) {
				startDt = newDt;
			});

			await downDt(allPicture[allPicture.length - 1], 0, function (newDt) {
				endDt = newDt;
			});

			run1 = setInterval(function () {
				if (startDt) {
					clearInterval(run1);

					async function nextFn() {
						let start = await new Card().palette(startDt);

						that.setData({
							templateStart: start
						});

						run = setInterval(function () {

							if (that.imagePathStart) {
								clearInterval(run);

								wx.uploadFile({
									url: 'https://yyxc.top/api/Upload/upload',
									filePath: that.imagePathStart,
									name: 'file',
									formData: {
										'user': 'test'
									},
									success(res1) {
										let data1 = JSON.parse(res1.data);
										Preview.push(data1);

										that.setData({
											templateStart: null
										});

										wx.removeStorageSync('savedFiles');

										run2 = setInterval(function () {
											if (endDt) {
												clearInterval(run2);

												async function endFn() {
													let end = await new Card().palette(endDt);

													that.setData({
														templateEnd: end
													});

													run3 = setInterval(function () {
														if (that.imagePathEnd) {
															clearInterval(run3);

															setTimeout(function () {
																wx.uploadFile({
																	url: 'https://yyxc.top/api/Upload/upload',
																	filePath: that.imagePathEnd,
																	name: 'file',
																	formData: {
																		'user': 'test'
																	},
																	success(res2) {
																		let data2 = JSON.parse(res2.data);
																		Preview.push(data2);

																		wx.removeStorageSync('savedFiles');

																		allData.music_id = music_id;
																		allData.text = allPicture;
																		allData.done = nowPage;
																		allData.start = data1.url;
																		allData.end = data2.url;

																		if (editID != null) {
																			// 编辑
																			allData.t_id = id;
																		} else {
																			// 新增
																			allData.t_id = that.data.mouldID;
																		}

																		that.setData({
																			allData: allData,
																		})

																		let openid = wx.getStorageSync('openid');
																		let text = JSON.stringify(allData)

																		let editID = that.data.editID;
																		let data, isEdit;

																		if (editID != null) {
																			// 编辑
																			isEdit = 1
																			data = {
																				openid: openid,
																				data: text,
																				id: editID
																			};
																		} else {
																			// 新增
																			isEdit = 2
																			data = {
																				openid: openid,
																				data: text
																			};
																		}

																		if (allFinish === 'finish') {

																			if (isEdit == 1) {

																				// 发送暂存数据
																				app.request('text/data', data, res => {

																					if (res.code === 200) {
																						app.showToast(res.msg, 'none');

																						let bianji = that.data.bianji;

																						if (bianji) {
																							app.redirectTo("/pages/prev/album?goodsId=" + editID);
																						} else {
																							app.navigateBack(1)
																						}
																					} else {
																						app.showToast(res.msg, 'none');
																					}
																				});

																			} else if (isEdit == 2) {

																				wx.setStorageSync('text', text);

																				app.redirectTo("/pages/prev/index?isEdit=" + isEdit);
																			}

																		} else if (allFinish === 'temporary') {

																			// 发送暂存数据
																			app.request('text/data', data, res => {

																				if (res.code === 200) {
																					app.showToast(res.msg, 'none');

																					if (editID != null) {

																						let takeZancun = {
																							nowPage: nowPage,
																							editID: editID,
																							Preview: Preview,
																						}
																						wx.setStorageSync('takeZancun', takeZancun);
																						app.navigateBack(2)

																					} else {
																						app.redirectTo("../user/my_work");
																					}
																				} else {
																					app.showToast(res.msg, 'none');
																				}
																			});
																		}
																		app.hideLoading();
																	}
																});
															}, 500);
														}
													}, 500);
												}

												endFn();
											}
										}, 500);
									}
								});
							}
						}, 500);
					}
					nextFn();
				}
			}, 500);
		}
		savePrev();
	},

	// 编辑完成
	Finish_editing() {
		that.setData({
			Finish_editing: true
		})
	},

	// 再想想
	noFinish() {
		that.setData({
			Finish_editing: false
		})
	},

	// 确定完成
	Finish() {
		let finish = 'finish'
		that.Temporary_storage(finish)
	},

})

