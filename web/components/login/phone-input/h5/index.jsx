import React from 'react';
import layout from './index.module.scss';
import { Input } from '@discuzq/design';
import '@discuzq/design/dist/styles/index.scss';
import CaptchaInput from './captcha-input';

class PhoneInputH5 extends React.Component {
  setCaptcha = (code) => {
    const { phoneCodeCallback = () => {} } = this.props;
    phoneCodeCallback(code);
  };
  setPhoneNum = (e) => {
    const { phoneNumCallback = () => {} } = this.props;
    const val = e.target.value;
    phoneNumCallback(val);
  };

  render() {
    const { phoneNum, captcha, codeTimeout, sendCodeCallback = () => {} } = this.props;
    return (
      <>
        {/* 手机号输入 start */}
        <div className={layout.phoneInput}>
          <Input
            mode="number"
            htmlType="number"
            className={layout.input}
            value={phoneNum}
            placeholder="请输入手机号码"
            onChange={this.setPhoneNum}
          />
          {codeTimeout ? (
            <div className={layout.countDown}>{codeTimeout}秒后再发送</div>
          ) : (
            <div className={layout.sendCaptcha} onClick={sendCodeCallback}>
              发送验证码
            </div>
          )}
        </div>
        {/* 手机号输入 end */}
        {/* 验证码 start */}
        <div className={layout.captchaInput}>
          <div className={layout['captchaInput-title']}>短信验证码</div>
          <CaptchaInput captcha={captcha} inputCallback={this.setCaptcha} />
        </div>
        {/* 验证码 end */}
      </>
    );
  }
}

export default PhoneInputH5;
