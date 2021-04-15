import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import layout from './index.module.scss';
import WeiXinOrCode from '@common/module/h5/WeixinOrCode';
import HeaderLogin from '@common/module/h5/HeaderLogin';


@inject('site')
@inject('user')
@inject('thread')
@observer
class WeixinOuter extends React.Component {
  render() {
    return (
        <div className={layout.container}>
            <HeaderLogin/>
            <div className={layout.content}>
                <div className={layout.title}>微信登录</div>
                {/* 二维码 start */}
                <WeiXinOrCode orCodeImg='' orCodeTips='长按保存二维码，并在微信中识别此二维码，即可完成登录'/>
                {/* 二维码 end */}
                <div className={layout['otherLogin-title']}>其他登录方式</div>
                <div className={layout['otherLogin-button']}>
                  <span onClick={() => {
                    this.props.router.push('login');
                  }} className={layout['otherLogin-button-weixin']}>
                    <img src="/login-user.png" alt=""/>
                  </span>
                  <span onClick={() => {
                    this.props.router.push('phone-login');
                  }} className={layout['otherLogin-button-user']}>
                    <img src='/login-phone.png' alt=""/>
                  </span>
                </div>
                <div className={layout['otherLogin-outer__tips']}>注册登录即表示您同意《注册协议》《隐私协议》</div>
            </div>
        </div>
    );
  }
}

export default withRouter(WeixinOuter);
