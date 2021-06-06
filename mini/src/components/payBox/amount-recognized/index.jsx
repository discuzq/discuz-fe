import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Icon from '@discuzq/design/dist/components/icon/index';
import Toast from '@discuzq/design/dist/components/toast/index';
import Button from '@discuzq/design/dist/components/button/index';
import Divider from '@discuzq/design/dist/components/divider/index';
import styles from './index.module.scss';
import { View, Text, Checkbox } from '@tarojs/components';
import { ORDER_TRADE_TYPE } from '../../../../../common/constants/payBoxStoreConstants';

@inject('payBox')
@observer
export default class AmountRecognized extends Component {

  constructor(props) {
    super(props)
    this.state = {
      tradeContent: [
        {
          type: ORDER_TRADE_TYPE.RED_PACKET,
          name: '红包'
        },
        {
          type: ORDER_TRADE_TYPE.POST_REWARD,
          name: '悬赏'
        }
      ]
    }
  }

  onClose = () => {
    // FIXME: 延时回调的修复
    this.props.payBox.visible = false
    setTimeout(() => {
      this.props.payBox.clear();
    }, 1000)
  }

  /**
   * 渲染不同交易类型
   * @param {String} type
   * @returns 返回对应交易类型名称
   */
  renderDiffTradeType = (type) => {
    let value = '';
    switch (type) {
      case ORDER_TRADE_TYPE.THEME: // 表示付费贴
        value = '付费帖';
        break;
      case ORDER_TRADE_TYPE.POST_REWARD: // 表示打赏
        value = '悬赏';
        break;
      case ORDER_TRADE_TYPE.REGEISTER_SITE:
        value = '表示付费加入';
        break;
      case ORDER_TRADE_TYPE.PUT_PROBLEM: // 付费提问
        value = '付费提问'
        break
      case ORDER_TRADE_TYPE.COMBIE_PAYMENT:
        value = '红包+悬赏'
        break
      case ORDER_TRADE_TYPE.REWARD: // 表示打赏
        value = '打赏'
        break
      case ORDER_TRADE_TYPE.AUTHORITY_GROUP:
        value = '购买权限组'
        break
      case ORDER_TRADE_TYPE.ATTACHMEMENT:
        value = '附件'
        break
      case ORDER_TRADE_TYPE.RED_PACKET:
        value = '红包'
        break
      default:
        break;
    }
    return value;
  };

  // 点击支付去到 选择支付方式页面
  goToThePayConfirmPage = async () => {
    try {
      await this.props.payBox.createOrder();
    } catch (error) {
      Toast.error({
        content: error.Message,
        hasMask: false,
        duration: 1000,
      });
      this.onClose()
    }
  };

  handleChangeIsAnonymous = (checked) => {
    this.props.payBox.isAnonymous = checked
  }

  renderContent = () => {
    const { options = {} } = this.props?.payBox;
    const { type, amount, isAnonymous, title, redAmount, rewardAmount } = options;
    return (
      <View className={styles.giftInfo}>
        {/* 标题 */}
        <View className={styles.amountTitle}>确认金额</View>
        {/* 主要内容区域 */}
        <View className={styles.amountContent}>
          <>
            {
              type === ORDER_TRADE_TYPE.COMBIE_PAYMENT ? (
                <>
                  {
                    this.state.tradeContent.map((item, index) => {
                      const amount_ = item.type === ORDER_TRADE_TYPE.RED_PACKET ? redAmount : rewardAmount
                      return <>
                        <View className={styles.acExplain}>
                          <Text className={styles.acExplainLabel}>交易类型</Text>{' '}
                          <Text className={styles.acExplainValue}>{this.renderDiffTradeType(item.type)}</Text>
                        </View>
                        <Divider className={styles.acExplainDivider} />
                        <View className={styles.acExplain} style={{display: 'flex'}}>
                          <Text className={styles.acExplainLabel}>商品名称</Text>{' '}
                          <Text style={{display: 'block'}} className={styles.acExplainValue}>{title}</Text>
                        </View>
                        <Divider className={styles.acExplainDivider} />
                        <View className={styles.acExplain}>
                          <Text className={styles.acExplainLabel}>支付金额</Text>
                          <Text className={styles.acExplainNum}>￥{this.transMoneyToFixed(amount_)}</Text>
                        </View>
                        {index === 0 && <View className={styles.ampuntLineWrap}><View className={styles.ampuntLine}></View></View>}
                      </>
                    })
                  }
                </>
              ) : (
                <>
                  <View className={styles.acExplain}>
                    <Text className={styles.acExplainLabel}>交易类型</Text>{' '}
                    <Text className={styles.acExplainValue}>{this.renderDiffTradeType(type)}</Text>
                  </View>
                  <Divider className={styles.acExplainDivider} />
                  <View className={styles.acExplain}>
                    <Text className={styles.acExplainLabel}>商品名称</Text>{' '}
                    <Text className={styles.acExplainValue}>{title}</Text>
                  </View>
                  <Divider className={styles.acExplainDivider} />
                  <View className={styles.acExplain}>
                    <Text className={styles.acExplainLabel}>支付金额</Text>
                    <Text className={styles.acExplainNum}>￥{this.transMoneyToFixed(amount)}</Text>
                  </View>
                  {
                    type === ORDER_TRADE_TYPE.REGEISTER_SITE &&
                    (
                      <View className={`${styles.acExplain} ${styles.acExplainH5}`}>
                        <Checkbox checked={this.props.payBox.isAnonymous} onChange={this.handleChangeIsAnonymous} /> 隐藏我的付费信息
                      </View>
                    )}
                </>
              )
            }
          </>
        </View>
      </View>
    );
  };

  // 转换金额小数
  transMoneyToFixed = (num) => {
    return Number(num).toFixed(2);
  };

  render() {
    const { options = {} } = this.props.payBox;
    const { amount = 0 } = options;
    return (
      <View className={styles.amountWrapper}>
        {this.renderContent()}
        {/* 按钮区域-提交内容 */}
        <View className={styles.btnBox}>
          <Button type="primary" onClick={this.goToThePayConfirmPage} size="large" className={styles.btn} full>
            支付 ￥{this.transMoneyToFixed(amount)}
          </Button>
        </View>
        {/* 关闭按钮 */}
        <View onClick={this.onClose} className={styles.payBoxCloseIcon}>
          <Icon name="CloseOutlined" size={12} />
        </View>
      </View>
    );
  }
}
