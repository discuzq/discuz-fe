import React from 'react';
import { Dialog, Button } from '@discuzq/design';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';

@inject('site')
@inject('user')
@inject('payBox')
@observer
class PayResultDialog extends React.Component {
  clearPayBox = () => {
    setTimeout(() => {
      this.props.payBox.clear();
    }, 500);
  }

  handleCancel = () => {
    this.clearPayBox();

    this.props.payBox.visible = false;
    this.props.payBox.h5SureDialogVisible = false;
  }

  handleSure = () => {
    this.props.payBox.visible = false;
    this.props.payBox.h5SureDialogVisible = false;
    this.props.payBox.getOrderDetail();
    this.clearPayBox();
  }

  render() {
    return (
      <Dialog
        style={{
          zIndex: 1500,
        }}
        className={styles.payResultDialog}
        visible={this.props.visible}
      >
        <div className={styles.content}>
          <div className={styles.title}>请确认微信支付是否已完成</div>
          <div className={styles.rule}>
            <p>1.如果您已在打开微信支付成功，请点击 “已完成付款”按钮</p>
            <p>2.如果您没有安装微信支付客户端，请点击“取消”并选择其它支付方式付款</p>
          </div>
          <div className={styles.buttonArea}>
            <div className={styles.buttonWrap}>
              <Button className={styles.cancelButton} onClick={this.handleCancel}>取消</Button>
            </div>
            <div className={styles.buttonWrap}>
              <Button type="primary" onClick={this.handleSure}>已完成付款</Button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default PayResultDialog;
