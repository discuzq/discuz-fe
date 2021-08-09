import React from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import { Popup, Icon, Button, Radio, Toast, Spin } from '@discuzq/design';
import Router from '@discuzq/sdk/dist/router';
import { PAY_MENT_MAP, PAYWAY_MAP, STEP_MAP } from '../../../../../common/constants/payBoxStoreConstants';
import isWeixin from '@common/utils/is-weixin';
import {
  listenWXJsBridgeAndExecCallback,
  listenWXJsBridgeAndExecCallbackH5,
  onBridgeReady,
  onBridgeReadyH5,
  wxValidator,
  mode,
} from '../../../../../common/store/pay/weixin-h5-backend';
import throttle from '@common/utils/thottle.js';

@inject('site')
@inject('user')
@inject('payBox')
@observer
export default class PayBox extends React.Component {
  constructor(props) {
    super(props);
    const payConfig = [
      {
        name: '钱包支付',
        icon: 'PurseOutlined',
        color: '#1878f3',
        paymentType: 'wallet',
      },
    ];

    // 判断是否微信支付开启
    if (this.props.site.isWechatPayOpen) {
      // if (isWeixin()) {
      payConfig.unshift({
        name: '微信支付',
        icon: 'WechatPaymentOutlined',
        color: '#09bb07',
        paymentType: 'weixin',
      });
      // }
    }

    this.state = {
      payConfig,
      isSubmit: false, // 是否提交
    };
    this.goSetPayPwa = this.goSetPayPwa.bind(this);
  }

  initState = () => {
    this.setState({
      isSubmit: false,
    });
    this.props.payBox.payWay = PAYWAY_MAP.WALLET;
  };

  componentDidMount = async () => {
    const { id } = this.props?.user;
    try {
      await this.props.payBox.getWalletInfo(id);
      this.initState();
    } catch (error) {
      Toast.error({
        content: '获取用户钱包信息失败',
        duration: 2000,
      });
    }
  };

  walletPaySubText() {
    const canWalletPay = this.props.user?.canWalletPay;
    const { options = {} } = this.props.payBox;
    const { amount = 0 } = options;
    if (!canWalletPay) {
      return (
        <Button type="text" className={styles.textButton} onClick={this.goSetPayPwa}>
          请设置支付密码
        </Button>
      );
    }
    if (Number(this.props.payBox?.walletAvaAmount) < Number(amount)) {
      return <p className={styles.subText}>余额不足</p>;
    }
    return (
      <>
        {this.props.payBox?.walletAvaAmount ? (
          <p className={styles.subText}>钱包余额：￥{this.props.payBox?.walletAvaAmount}</p>
        ) : (
          <Spin type="spinner" size={14}></Spin>
        )}
      </>
    );
  }

  goSetPayPwa() {
    Router.push({ url: `/my/edit/paypwd?type=paybox` });
    this.props.payBox.visible = false;
  }

  /**
   * 选择支付方式
   */
  handleChangePaymentType = (value) => {
    this.props.payBox.payWay = value;
  };

  // 点击确认支付
  handlePayConfirmed = throttle(async () => {
    if (this.props.payBox.payWay === PAYWAY_MAP.WALLET) {
      const { options = {} } = this.props.payBox;
      const { amount = 0 } = options;
      if (Number(this.props.payBox?.walletAvaAmount) < Number(amount)) {
        Toast.error({
          content: '钱包余额不足',
          duration: 2000,
        });
        return;
      }
      // 表示钱包支付
      this.props.payBox.walletPayEnsure();
    } else if (this.props.payBox.payWay === PAYWAY_MAP.WX) {
      // FIXME: 增加兜底处理
      // 表示微信支付
      try {
        this.setState({
          isSubmit: true,
        });
        if (!isWeixin()) {
          await this.props.payBox.wechatPayOrder({
            listenWXJsBridgeAndExecCallback: listenWXJsBridgeAndExecCallbackH5,
            onBridgeReady: onBridgeReadyH5,
            wxValidator,
            mode: PAY_MENT_MAP.WX_H5,
          });
          this.props.payBox.visible = false;
          this.setState({
            isSubmit: false,
          });
          return;
        }
        await this.props.payBox.wechatPayOrder({ listenWXJsBridgeAndExecCallback, onBridgeReady, wxValidator, mode });
        this.setState({
          isSubmit: false,
        });
      } catch (e) {
        console.error(e);
        Toast.error({
          content: e.Message || '拉起微信支付失败',
          duration: 2000,
        });
        this.setState({
          isSubmit: false,
        });
      }
      // this.props.payBox.visible = false
    }
  }, 500);

  // 点击取消
  handleCancel = () => {
    // 回到上一步
    this.props.payBox.step = STEP_MAP.SURE;
    this.props.payBox.payWay = null;
  };

  // 转换金额小数
  transMoneyToFixed = (num) => {
    return Number(num).toFixed(2);
  };

  // 获取按钮禁用状态
  getDisabledWithButton = () => {
    const { isSubmit } = this.state;
    const canWalletPay = this.props.user?.canWalletPay;
    const { options = {} } = this.props.payBox;
    const { amount = 0 } = options;
    let disabled = !this.props.payBox.payWay || isSubmit;
    if (this.props.payBox.payWay === PAYWAY_MAP.WALLET) {
      if (!canWalletPay) {
        disabled = true;
      }
      if (Number(this.props.payBox?.walletAvaAmount) < Number(amount)) {
        disabled = true;
      }
    }
    return disabled;
  };

  gotoBind = () => {
    this.props.payBox.visible = false;
    Router.push({ url: '/user/wx-bind-qrcode' });
  }

  renderRightChoices = (item) => {
    const { options = {} } = this.props.payBox;
    const canWalletPay = this.props.user?.canWalletPay;

    if (item.paymentType === PAYWAY_MAP.WALLET) {
      if (canWalletPay && Number(this.props.payBox?.walletAvaAmount) >= Number(options.amount)) {
        return <Radio name={item.paymentType} />;
      }

      return this.walletPaySubText();
    }

    if (item.paymentType === PAYWAY_MAP.WX) {
      if (!this.props.user.isBindWechat) {
        return (
          <Button className={styles.textButton} type="text" onClick={this.gotoBind}>
            绑定微信
          </Button>
        );
      }

      return <Radio name={item.paymentType} />;
    }
  };

  render() {
    const { options = {} } = this.props.payBox;
    const { payConfig, isSubmit } = this.state;
    return (
      <div className={styles.payBox}>
        <div className={styles.title}>
          <p>
            <span className={styles.moneyUnit}>￥</span>
            {this.transMoneyToFixed(options.amount)}
          </p>
        </div>
        <div className={styles.list}>
          <Radio.Group
            value={this.props.payBox.payWay}
            onChange={(checked) => {
              this.handleChangePaymentType(checked);
            }}
          >
            {payConfig.map((item, key) => {
              return (
                <div key={key} className={styles.listItem}>
                  <div className={styles.left}>
                    <Icon className={styles.icon} name={item.icon} color={item.color} size={20} />
                    <p className={styles.text}>{item.name}</p>
                  </div>
                  <div className={styles.right}>{this.renderRightChoices(item)}</div>
                </div>
              );
            })}
          </Radio.Group>
        </div>
        <div className={styles.btnBox}>
          <Button
            disabled={this.getDisabledWithButton()}
            className={styles.btn}
            type="primary"
            size="large"
            full
            onClick={this.handlePayConfirmed}
          >
            {isSubmit ? <Spin type="spinner">拉起支付中...</Spin> : '确认支付'}
          </Button>
        </div>
        {/* 关闭按钮 */}
        <div className={styles.payBoxCloseIcon} onClick={this.handleCancel}>
          <Icon name="CloseOutlined" size={14} />
        </div>
      </div>
    );
  }
}
