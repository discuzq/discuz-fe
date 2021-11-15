import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import styles from './index.module.scss';
import classNames from 'classnames';

@inject('site')
@observer
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
      canvasWidth: 92,
      canvasHeight: 92,
    };
    this.canvasElement = React.createRef();
  }

  componentWillMount() {}
  drawBigCricle(startAngle, endAngle, color) {
    const canvas = this.canvasElement.current;
    if (canvas.getContext) {
      var context = canvas.getContext('2d');
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
    }
  }
  drawSmallCricle() {
    const canvas = this.canvasElement.current;
    var cX = this.state.canvasWidth / 2; //圆心X坐标
    var cY = this.state.canvasHeight / 2; //圆心Y坐标
    var sR = 25; //设置小圆半径
    // step2 创建小圆
    if (canvas.getContext) {
      var context = canvas.getContext('2d');
      context.beginPath();
      context.moveTo(cX, cY);
      context.arc(cX, cY, sR, 0, Math.PI * 2);
      context.fillStyle = '#fff';
      context.lineCap = 'round';
      context.fill();
    }
  }

  renderContent() {
    // 设置每个扇形的弧度比例以及颜色
    var setArr = [
      {
        scale: 0.5 * 2 * Math.PI,
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
      this.drawBigCricle(startAngle, endAngle, setArr[i].color); //调用封装函数
      startAngle = endAngle;
    }
    this.drawSmallCricle();
  }

  componentDidMount() {
    setTimeout(() => {
      this.renderContent();
    }, 100);
  }
  render() {
    const { readerRate } = this.state;
    return (
      <div className={styles.canvasWrap}>
        <canvas
          width={this.state.canvasWidth}
          height={this.state.canvasHeight}
          className={styles.canvasBox}
          ref={this.canvasElement}
        ></canvas>
        <div className={styles.canvasTitle}>来源分布</div>
        <div className={classNames(styles.canvasLegend, this.props.site.platform === 'pc' && styles.pc)}>
          {readerRate.map((item, index) => {
            return (
              <div className={styles.canvasLegendItem} key={index}>
                <span className={styles.square} style={{ background: item.color }}></span>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.value}>{item.value}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
