import React, { useState, Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Popup, Toast } from '@discuzq/design';
import { Icon, Button } from '@discuzq/design';
import styles from './index.module.scss';
import MoneyInput from '../money-input';
import classNames from 'classnames';
@inject('wallet')
@inject('site')
class WithdrawalPop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      inputValue: '', // 金额输入内容
    };
  }

  updateState = ({ name, value }) => {
    this.setState({
      [name]: value,
    });
  };

  onChange = (data) => {
    const datas = data.match(/([1-9]\d{0,9}|0)(\.\d{0,2})?/);
    this.setState({
      inputValue: datas ? datas[0] : '',
    });
  };

  initState = () => {
    this.setState({
      visible: true,
      inputValue: '',
    });
    this.props.onClose && this.props.onClose();
  };

  // 获取禁用逻辑
  getDisabeledButton = () => {
    const { inputValue } = this.state;
    const btnDisabled =
      !inputValue ||
      parseFloat(inputValue) > parseFloat(this.props.wallet?.walletAvaAmount) ||
      parseFloat(inputValue) < parseFloat(this.props.site?.cashMinSum);
    return btnDisabled;
  };

  // 提现到微信钱包
  moneyToWeixin = async () => {
    // if (!this.state.inputValue || parseFloat(this.state.inputValue) < parseFloat(this.props.site?.cashMinSum)) {
    //   return Toast.warning({ content: '不得小于最低提现金额' });
    // }
    if (this.getDisabeledButton()) return;
    this.props.wallet
      .createWalletCash({
        money: this.state.inputValue,
      })
      .then(async (res) => {
        Toast.success({
          content: '申请提现成功',
          hasMask: false,
          duration: 2000,
        });
        const { getUserWalletInfo } = this.props.wallet;
        await getUserWalletInfo();
        // 如果触发提现回调
        if (this.props.onCreateCash) {
          this.props.onCreateCash();
        }
        this.initState();
      })
      .catch((err) => {
        if (err.Code) {
          Toast.error({
            content: err.Msg || '申请提现失败，请重试',
            duration: 2000,
          });
        }
        this.initState();
      });
  };

  render() {
    const { visible: popupVisible, onClose, moneyToWixin } = this.props;
    const walletAvaAmount = this.props.wallet.walletAvaAmount;
    const cashMinSum = this.props.site?.cashMinSum;

    return (
      <Popup position="center" visible={popupVisible} onClose={onClose}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div></div>
            <div className={styles.title}>提现</div>
            <div onClick={onClose}>
              <Icon name="CloseOutlined" size="12" color="#8590a6"></Icon>
            </div>
          </div>
          <div className={styles.availableAmount}>
            <div className={styles.text}>可提现金额</div>
            <div className={styles.moneyNum}>{walletAvaAmount}</div>
          </div>
          <div className={styles.moneyInput}>
            <MoneyInput
              inputValue={this.state.inputValue}
              onChange={this.onChange}
              updateState={this.updateState}
              visible={this.state.visible}
              minAmount={cashMinSum}
              maxAmount={walletAvaAmount}
            ></MoneyInput>
          </div>
          <div
            className={classNames(styles.button, {
              [styles.bgBtnColor]: !this.getDisabeledButton(),
            })}
          >
            <Button type={'primary'} onClick={this.moneyToWeixin} disabled={this.getDisabeledButton()}>
              提现到微信钱包
            </Button>
          </div>
        </div>
      </Popup>
    );
  }
}

export default WithdrawalPop;
