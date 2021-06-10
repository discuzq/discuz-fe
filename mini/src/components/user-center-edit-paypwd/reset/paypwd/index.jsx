import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Taro from '@tarojs/taro';
import Button from '@discuzq/design/dist/components/button/index';
import Input from '@discuzq/design/dist/components/input/index';
import Toast from '@discuzq/design/dist/components/toast/index';
import Header from '@components/header';
import styles from './index.module.scss';
import Router from '@discuzq/sdk/dist/router';
import { View, Text } from '@tarojs/components';
import throttle from '@common/utils/thottle.js';
import classNames from 'classnames';

@inject('payBox')
@observer
export default class index extends Component {

  componentDidMount() {
    this.props.payBox.clearPayPassword()
  }

  // 设置新密码 newPayPwd
  handleChangeNewPwd = (e) => {
    this.props.payBox.newPayPwd = e.target.value
  }

  // 确认新密码 newPayPwdRepeat
  handleChangeRepeatPwd = (e) => {
    this.props.payBox.newPayPwdRepeat = e.target.value
  }

  componentDidUpdate = async (prevProps) => {
    if (this.props.ticket && this.props.randstr) {
      if (!prevProps.ticket || !prevProps.randstr) {
        try {
          this.getVerifyCode({});
        } catch (e) {
          console.log(e);
        }
      }
    }
  };

  // 点击确认 ---> 清空对应密码状态
  handleSubmit = throttle(() => {
    if (this.getDisabledWithButton()) return
    const newPayPwd = this.props.payBox?.newPayPwd
    const newPayPwdRepeat = this.props.payBox?.newPayPwdRepeat
    if (newPayPwd !== newPayPwdRepeat) {
      Toast.error({
        content: '两次密码输入有误',
        hasMask: false,
        duration: 1000,
      })
      this.props.payBox.clearPayPassword()
      return
    }
    this.props.payBox.resetPayPwd().then(res => {
      Toast.success({
        content: '修改密码成功',
        hasMask: false,
        duration: 1000,
      })
      Taro.navigateBack({url: '/subPages/my/edit/index'})
      this.props.payBox.clearPayPassword()
    }).catch((err) => {
      console.error(err);
      Toast.error({
        content: err.Msg || '修改密码失败',
        hasMask: false,
        duration: 1000,
      })
      this.props.payBox.clearPayPassword()
    })
  }, 300)

  /**
  * 获取按钮禁用状态
  * @returns true 表示禁用 false表示不禁用
  */
  getDisabledWithButton = () => {
    const newPayPwd = this.props.payBox?.newPayPwd
    const newPayPwdRepeat = this.props.payBox?.newPayPwdRepeat
    return !newPayPwd || !newPayPwdRepeat
  }

  render() {
    const newPayPwd = this.props.payBox?.newPayPwd
    const newPayPwdRepeat = this.props.payBox?.newPayPwdRepeat
    return (
        <View id={styles.resetPayPwdContent}>
          <View className={styles.content}>
            <Text className={styles.setTtile}>设置新密码</Text>
            <View className={styles.labelInfo}>
              <View className={styles.labelValue}>
                <Input className={styles.input} value={newPayPwd} onChange={this.handleChangeNewPwd} mode="password" placeholder="请输入新密码" type="number" maxLength={6} trim />
              </View>
            </View>
            <View className={styles.labelInfo}>
              <View className={styles.labelValue}>
                <Input className={styles.input} type="number" maxLength={6} value={newPayPwdRepeat} onChange={this.handleChangeRepeatPwd} mode="password" placeholder="请重复输入新密码" trim />
              </View>
            </View>
          </View>
          <View className={classNames(styles.bottom, {
            [styles.bgBtnColor]: !this.getDisabledWithButton()
          })}>
            <Button full disabled={this.getDisabledWithButton()} onClick={this.handleSubmit} type={"primary"} className={styles.btn}>提交</Button>
          </View>
        </View>
    )
  }
}
