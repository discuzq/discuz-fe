import React, { Component } from 'react';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import { View } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

export default class Popover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 当前显隐状态
      visible: false,
      showMask: false,
    };
  }

  setShowMask(show) {
    this.setState({ showMask: show });
  }

  clickMask = (e) => {
    e.stopPropagation();
    this.onHide();
    this.setShowMask(false);
  };
  onHide = () => {
    this.setState({ visible: false });
  };

  handleClick = () => {
    Taro.createSelectorQuery()
      .in(getCurrentInstance().page)
      .select('.buttonPopver')
      .boundingClientRect((res) => {
        this.setShowMask(true);
        this.onDisplay(res);
      })
      .exec();
  };

  onDisplay = (e) => {
    this.setState({ visible: !this.state.visible });
  };

  render() {
    const { windowHeight, windowWidth } = Taro.getSystemInfoSync();
    const maskStyle = {
      position: 'fixed',
      height: windowHeight + 'px',
      width: windowWidth + 'px',
      background: 'transparent',
      zIndex: 1000,
      left: 0,
      top: 0,
    };
    const { visible, showMask } = this.state;
    const { contentStyle, placement } = this.props;
    return (
      <View onClick={this.handleClick}>
        {showMask && <View style={maskStyle} onClick={this.clickMask}></View>}
        <View className={styles.buttonPopver} class="buttonPopver">
          {this.props.children}
        </View>

        <View className={styles.popoverBox}>
          {visible && (
            <View className={classnames(styles.popoverView, styles[placement])} style={contentStyle}>
              {this.props.content}
            </View>
          )}
        </View>
      </View>
    );
  }
}
