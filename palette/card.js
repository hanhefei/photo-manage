export default class LastMayday {
  palette(dt) {
    let obj = {
      width: '375px',
      height: '530px',
      background: '#fff',
      views: []
    };

    for (let [idx, i] of dt.entries()) {
		console.log(i);
      if (i.type != "text") {
        obj.views.push({
            type: 'image',
            url: i.downUrl,
            // url: i.url,
            css: {
              top: i.y * 530 + 'px',
              left: i.x * 375 + 'px',
              height: i.height * 530 + 'px',
              width: i.width * 375 + 'px',
              rotate: i.rotate
            }
        });
      } else {
        obj.views.push({
          type: 'text',
          text: i.content,
          css: [{
            fontSize: i.fontSize * 375 + 'px',
            color: i.color,
            rotate: i.rotate,
            top: i.y * 530 + 'px',
            left: i.x * 375 + 'px',
            align: 'center',
            height: i.height * 530 + 'px',
            width: i.width * 375 + 'px',
            textAlign: 'center'
          }]
        })
	  }
	  
      if (idx == dt.length - 1) {
        return obj;
      }
    }
   
  }

  palettes(prevImg, prevCode, prevName, userName) {
	return ({
		"width": "375px",
		"height": "667px",
		"background": "#f8f8f8",
		"views": [{
				"type": "image",
				"url": prevImg,
				"css": {
					"width": "375px",
					"height": "530px",
					"top": "1px",
					"left": "1px",
					"rotate": "0",
					"borderRadius": "",
					"borderWidth": "",
					"borderColor": "",
					"shadow": "",
					"mode": "scaleToFill"
				}
			},
			{
				"type": "image",
				"url": prevCode,
				"css": {
					"width": "90px",
					"height": "90px",
					"top": "555px",
					"left": "265px",
					"rotate": "0",
					"borderRadius": "",
					"borderWidth": "",
					"borderColor": "",
					"shadow": "",
					"mode": "scaleToFill"
				}
			},
			{
				"type": "text",
				"text": "欢迎扫码欣赏我做的",
				"css": {
					"color": "#333",
					"background": "rgba(0,0,0,0)",
					"width": "200px",
					"height": "28.599999999999994px",
					"top": "555px",
					"left": "29px",
					"rotate": "0",
					"borderRadius": "",
					"borderWidth": "",
					"borderColor": "#000000",
					"shadow": "",
					"padding": "0px",
					"fontSize": "20px",
					"fontWeight": "normal",
					"maxLines": "2",
					"lineHeight": "28.860000000000007px",
					"textStyle": "fill",
					"textDecoration": "none",
					"fontFamily": "",
					"textAlign": "right"
				}
			},
			{
				"type": "text",
				"text": "--" + userName,
				"css": {
					"color": "#333",
					"background": "rgba(0,0,0,0)",
					"width": "200px",
					"height": "28.599999999999994px",
					"top": "615px",
					"left": "25px",
					"rotate": "0",
					"borderRadius": "",
					"borderWidth": "",
					"borderColor": "#000000",
					"shadow": "",
					"padding": "0px",
					"fontSize": "20px",
					"fontWeight": "normal",
					"maxLines": "2",
					"lineHeight": "28.860000000000007px",
					"textStyle": "fill",
					"textDecoration": "none",
					"fontFamily": "",
					"textAlign": "right"
				}
			},
			{
				"type": "text",
				"text": "“" + prevName + "”相片书",
				"css": {
					"color": "#333",
					"background": "rgba(0,0,0,0)",
					"width": "215px",
					"height": "28.599999999999994px",
					"top": "585px",
					"left": "10px",
					"rotate": "0",
					"borderRadius": "",
					"borderWidth": "",
					"borderColor": "#000000",
					"shadow": "",
					"padding": "0px",
					"fontSize": "20px",
					"fontWeight": "normal",
					"maxLines": "2",
					"lineHeight": "28.860000000000007px",
					"textStyle": "fill",
					"textDecoration": "none",
					"fontFamily": "",
					"textAlign": "right"
				}
			}
		]
	});
  }
}

const startTop = 50;
const startLeft = 20;
const gapSize = 70;
const common = {
  left: `${startLeft}rpx`,
  fontSize: '40rpx',
};

function _textDecoration(decoration, index, color) {
  return ({
    type: 'text',
    text: decoration,
    css: [{
      top: `${startTop + index * gapSize}rpx`,
      color: color,
      textDecoration: decoration,
    }, common],
  });
}

function _image(index, rotate, borderRadius) {
  return (
    {
      type: 'image',
      url: '/palette/avatar.jpg',
      css: {
        top: `${startTop + 8.5 * gapSize}rpx`,
        left: `${startLeft + 160 * index}rpx`,
        width: '120rpx',
        height: '120rpx',
        shadow: '10rpx 10rpx 5rpx #888888',
        rotate: rotate,
        borderRadius: borderRadius,
      },
    }
  );
}

function _des(index, content) {
  const des = {
    type: 'text',
    text: content,
    css: {
      fontSize: '22rpx',
      top: `${startTop + 8.5 * gapSize + 140}rpx`,
    },
  };
  if (index === 3) {
    des.css.right = '60rpx';
  } else {
    des.css.left = `${startLeft + 120 * index + 30}rpx`;
  }
  return des;
}
