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
    this.getmoneyNum(datas ? datas[0] : '');
  };

  initState = () => {
    this.setState({
      visible: true,
      moneyOverThanAmount: false, // 是否超过当前可提现金额
      withdrawalAmount: 0,
      inputValue: '',
    });
  };

  // 获得输入的提现金额
  getmoneyNum = (data) => {
    if (Number(data) >= 1) {
      this.setState({
        withdrawalAmount: data,
      });

      if (Number(this.state.withdrawalAmount) > this.props.wallet?.availableAmount) {
        this.setState({
          moneyOverThanAmount: true,
        });
      }
    } else {
      this.setState({
        withdrawalAmount: 0,
        moneyOverThanAmount: false,
      });
    }
  };

  // 提现到微信钱包
  moneyToWeixin = async () => {
    if (
      !this.state.withdrawalAmount ||
      parseFloat(this.state.withdrawalAmount) < parseFloat(this.props.site.cashMinSum)
    ) {
      return Toast.warning({ content: '不得小于最低提现金额' });
    }

    this.props.wallet
      .createWalletCash({
        money: this.state.withdrawalAmount,
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

  render() {
    const { inputValue } = this.state;
    const btnDisabled =
      !inputValue || parseFloat(this.state.withdrawalAmount) > parseFloat(this.props.wallet?.availableAmount);
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
                // getmoneyNum={data => this.getmoneyNum(data)}
                inputValue={this.state.inputValue}
                onChange={this.onChange}
                updateState={this.updateState}
                visible={this.state.visible}
                minmoney={this.props.site.cashMinSum}
                maxmoney={this.props.walletData?.availableAmount}
              />
            </div>
          </div>
          <div
            className={classNames(styles.footer, {
              [styles.bgBtnColor]: !btnDisabled,
            })}
          >
            <Button type={'primary'} className={styles.button} onClick={this.moneyToWeixin} disabled={btnDisabled}>
              提现到微信钱包
            </Button>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(Withdrawal);
