import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import Header from '@components/header';
import MoneyInput from './components/money-input';
import styles from './index.module.scss';
import { Icon, Button, Toast } from '@discuzq/design';
import classNames from 'classnames';
import Router from '@discuzq/sdk/dist/router';

@inject('wallet')
@inject('site')
@observer
class Withdrawal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      moneyOverThanAmount: false, // 是否超过当前可提现金额
      withdrawalAmount: 0,
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
      moneyOverThanAmount: false, // 是否超过当前可提现金额
      withdrawalAmount: 0,
      inputValue: '',
    });
  };

  // 提现到微信钱包
  moneyToWeixin = async () => {
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
        this.initState();
        Router.back();
      })
      .catch((err) => {
        console.error(err);
        if (err.Code) {
          Toast.error({
            content: err.Msg || '申请提现失败，请重试',
            duration: 2000,
          });
        }
        this.initState();
      });
    // this.setState({ visible: !this.state.visible });
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

  render() {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.main}>
            <div className={styles.totalAmount}>
              <div className={styles.moneyTitle}>可提现金额</div>
              <div className={styles.moneyNum}>{this.props.walletData?.availableAmount}</div>
            </div>
            <div className={styles.moneyInput}>
              <MoneyInput
                inputValue={this.state.inputValue}
                onChange={this.onChange}
                updateState={this.updateState}
                visible={this.state.visible}
                minmoney={this.props.site.cashMinSum}
                maxmoney={this.props.walletData?.availableAmount}
                type='withdrawal'
              />
            </div>
          </div>
          <div
            className={classNames(styles.footer, {
              [styles.bgBtnColor]: !this.getDisabeledButton(),
            })}
          >
            <Button
              type={'primary'}
              className={styles.button}
              onClick={this.moneyToWeixin}
              disabled={this.getDisabeledButton()}
            >
              提现到微信钱包
            </Button>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(Withdrawal);
