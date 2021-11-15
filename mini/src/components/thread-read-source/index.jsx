import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Canvas } from '@tarojs/components';
import styles from './index.module.scss';
export default class ThreadReadSource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      readerRate: [
        {
          name: '站内阅读',
          value: 50,
          color: '#286BF6',
        },
        {
          name: '海报阅读',
          value: 10,
          color: '#93B4FA',
        },
        {
          name: '链接阅读',
          value: 40,
          color: '#8792A7',
        },
      ],
      canvasHeight: 92,
      canvasWidth: 92,
    };
    this.canvasElement = React.createRef();
  }

  componentWillMount() {}
  getCanvas = async (eleId = '', delay = 200) =>
    new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        clearTimeout(t);
        Taro.createSelectorQuery()
          .select(`#${eleId}`)
          .fields({ node: true, size: true })
          .exec((res) => {
            if (res && res[0] && res[0].node) {
              const canvas = res[0].node;
              const context = canvas.getContext('2d');
              resolve({ canvas, context });
            } else {
              reject('获取canvas失败');
            }
          });
      }, delay);
    });

  async drawBigCricle(startAngle, endAngle, color) {
    const { canvas, context } = await this.getCanvas('mycanvas');

    var cX = this.state.canvasWidth / 2; //圆心X坐标
    var cY = this.state.canvasHeight / 2; //圆心Y坐标
    var bR = 46; //设置大圆半径

    // step1 创建大圆
    context.beginPath();
    context.moveTo(cX, cY);
    context.lineTo(cX + bR * Math.cos(startAngle), cY + bR * Math.sin(startAngle));
    context.arc(cX, cY, bR, startAngle, endAngle);
    context.lineTo(cX, cY);
    context.fillStyle = color;
    context.fill();

    // 添加以下代码是为 解决小圆未把大圆区域全部填充完全的问题，如上图所示边缘存在红色虚线
    context.strokeStyle = '#fff';
    context.lineWidth = 4;
    context.stroke();
    // }
  }
  async drawSmallCricle() {
    const { canvas, context } = await this.getCanvas('mycanvas');
    var cX = this.state.canvasWidth / 2; //圆心X坐标
    var cY = this.state.canvasHeight / 2; //圆心Y坐标
    var sR = 25; //设置小圆半径
    // step2 创建小圆
    context.beginPath();
    context.moveTo(cX, cY);
    context.arc(cX, cY, sR, 0, Math.PI * 2);
    context.fillStyle = '#fff';
    context.lineCap = 'round';
    context.fill();
  }

  async renderContent() {
    // this.drawDonuts()
    // 设置每个扇形的弧度比例以及颜色
    var setArr = [
      {
        scale: 0.49 * 2 * Math.PI,
        color: '#286BF6',
      },
      {
        scale: 0.1 * 2 * Math.PI,
        color: '#93B4FA',
      },
      {
        scale: 0.4 * 2 * Math.PI,
        color: '#8792A7',
      },
    ];

    var startAngle = 0;
    var endAngle = 0;
    for (var i = 0; i < setArr.length; i++) {
      endAngle += setArr[i].scale;
      await this.drawBigCricle(startAngle, endAngle, setArr[i].color); //调用封装函数
      startAngle = endAngle;
    }
    await this.drawSmallCricle();
  }

  componentDidMount() {
    this.renderContent();
  }
  render() {
    const { readerRate } = this.state;
    return (
      <View className={styles.canvasWrap}>
        <View
          style={{
            width: this.state.canvasWidth,
            height: this.state.canvasHeight,
          }}
          className={styles.canvasBox}
        >
          <Canvas type="2d" id="mycanvas" ref={this.canvasElement}></Canvas>
        </View>

        <View className={styles.canvasTitle}>来源分布</View>
        <View className={styles.canvasLegend}>
          {readerRate.map((item, index) => {
            return (
              <View className={styles.canvasLegendItem}>
                <Text className={styles.square} style={{ background: item.color }}></Text>
                <Text className={styles.name}>{item.name}</Text>
                <Text className={styles.value}>{item.value}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }
}
