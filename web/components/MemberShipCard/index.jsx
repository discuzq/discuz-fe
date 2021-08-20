import React, { Component } from 'react';
import styles from './index.module.scss';
import { Button } from '@discuzq/design';
import { inject, observer } from 'mobx-react';
import time from '@discuzq/sdk/dist/time';

@inject('site')
@inject('user')
@observer
export default class MemberShipCard extends Component {
  constructor(props) {
    super(props);
  }

  handleRenewalFee = () => {
    this.props.onRenewalFeeClick && this.props.onRenewalFeeClick();
  };

  // 获取日期格式
  getDateFormat = () => {
    if (time.isCurrentYear(this.props.user?.expiredAt)) {
      return 'MM月DD日';
    } else {
      return 'YYYY年MM月DD日';
    }
  };

  renderFeeDateContent = () => {
    if (this.props.user?.expiredDays === 0) {
      return (
        <>
          <span className={styles.feeDay}>{this.props.user?.expiredDays}</span>天
        </>
      );
    } else {
      return (
        <>
          <span className={styles.feeDay}>{this.props.user?.expiredDays}</span>天•
          {time.formatDate(this.props.user?.expiredAt, this.getDateFormat())}
        </>
      );
    }
  };

  render() {
    const { shipCardClassName } = this.props;
    return (
      <div className={`${styles.memberShipCardWrapper} ${shipCardClassName}`}>
        <div className={styles.MemberShipCardContent}>
          <div className={styles.roleType}>{this.props.user?.groupName}</div>
          <div className={styles.tagline}>访问海量站点内容•发布内容</div>
          <div className={styles.RenewalFee}>
            <Button onClick={this.handleRenewalFee} type="primary" className={styles.btn}>
              续费
            </Button>
            <span className={styles.feeTimer}>{this.renderFeeDateContent()}</span>
          </div>
        </div>
      </div>
    );
  }
}
