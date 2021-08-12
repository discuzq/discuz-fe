import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import layout from './index.module.scss';
import HomeHeader from '@components/home-header';
import { Button, Toast } from '@discuzq/design';
import { h5WechatCodeBind } from '@server';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, checkUserStatus } from '@common/store/login/util';
import setAccessToken from '@common/utils/set-access-token';
import { get } from '@common/utils/get';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import { isExtFieldsOpen } from '@common/store/login/util';

let bindLoading = false;
const NEED_BIND_OR_REGISTER_USER = -7016;

@inject('site')
@inject('user')
@inject('h5QrCode')
@inject('commonLogin')
@observer
class WeixinBindH5Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: ''
    }
  }
  render() {
    const { sessionToken, loginType, code, sessionId, state, nickname = '', jumpType = '' }  = this.props.router.query;
    const { status } = this.state;
    const { site } = this.props;
    const { platform } = site;
    return (
      <div className={layout.container}>
        <HomeHeader hideInfo mode='login'/>
        <div className={layout.content}>
          <div className={layout.title}>绑定微信号</div>
          <div className={layout.tips}>
            {nickname ? `${nickname}，` : ''}{this.props.h5QrCode.bindTitle}
            { jumpType === '1' && status === 'success' && <><br/>请返回原页面继续支付</>}
          </div>
          {
            this.props.h5QrCode.isBtn
              ? <>
                <Button
                  className={layout.button}
                  type="primary"
                  onClick={() => this.bind({
                    params: { sessionToken, code, sessionId, type: loginType, state },
                  })}
                >
                  绑定微信，并继续访问
                </Button>
                </>
              : <></>
          }
          <Button
            className={layout.exit}
            onClick={() => {
              this.props.h5QrCode.bindTitle = '已取消绑定';
              this.props.h5QrCode.isBtn = false;
              window.wx && window.wx.ready(() => {
                wx.closeWindow();
              });
            }}>
            退出
          </Button>
        </div>
      </div>
    );
  }

  bind = async (opts) => {
    try {
      if (bindLoading) {
        return;
      }
      const { jumpType = '' }  = this.props.router.query;
      const { router } = this.props;
      bindLoading = true;
      const res = await h5WechatCodeBind(opts);
      bindLoading = false;

      // 落地页开关打开
      if (res.code === NEED_BIND_OR_REGISTER_USER) {
        const { sessionToken, nickname } = res.data;
        router.push({ pathname: 'wx-select', query: { sessionToken, nickname } });
        return;
      }
      const { loginType }  = this.props.router.query;
      if (res.code === 0) {
        this.setState({
          status: 'success'
        });
      }
      if (res.code === 0 && loginType === 'h5' && jumpType !== '1') {
        const accessToken = get(res, 'data.accessToken');
        const uid = get(res, 'data.uid');
        // 注册成功后，默认登录
        setAccessToken({
          accessToken,
        });
        this.props.h5QrCode.bindTitle = '已成功绑定，正在跳转到首页';
        this.props.h5QrCode.isBtn = false;
        this.props.user.updateUserInfo(uid);
        window.location.href = '/';
        return;
      }
      if (res.code === 0) {
        this.props.h5QrCode.bindTitle = '已成功绑定';
        this.props.h5QrCode.isBtn = false;
        return;
      }
      checkUserStatus(res);
      throw {
        Code: res.code,
        Message: res.msg,
      };
    } catch (error) {
      bindLoading = false;
      this.props.h5QrCode.bindTitle = '绑定失败，请刷新二维码重新扫码';
      this.props.h5QrCode.isBtn = false;
      this.setState({
        status: 'error'
      });

      const { site } = this.props;
      // 跳转补充信息页
      if (error.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
        if (isExtFieldsOpen(site)) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
          this.props.router.push('/user/supplementary');
          return;
        }
        return window.location.href = '/';
      }

      // 跳转状态页
      if (error.Code === BANNED_USER || error.Code === REVIEWING || error.Code === REVIEW_REJECT) {
        const uid = get(error, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        this.props.commonLogin.setStatusMessage(error.Code, error.Message);
        this.props.router.push(`/user/status?statusCode=${error.Code}&statusMsg=${error.Message}`);
        return;
      }
      if (error.Code) {
        Toast.error({
          content: error.Message,
        });
        return;
      }
      throw {
        Code: 'ulg_9999',
        Message: '网络错误',
        error,
      };
    }
  }
}

export default withRouter(WeixinBindH5Page);
