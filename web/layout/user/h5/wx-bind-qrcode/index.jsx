import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import layout from './index.module.scss';
import { Toast } from '@discuzq/design';
import WeixinQrCode from '@components/login/wx-qr-code';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import { get } from '@common/utils/get';
import { BANNED_USER, REVIEWING, REVIEW_REJECT } from '@common/store/login/util';
import PcBodyWrap from '../components/pc-body-wrap';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import { isExtFieldsOpen } from '@common/store/login/util';
import { genMiniBindScheme } from '@server';
import SkipMiniPopup from '@components/login/skip-mini-popup';
import locals from '@common/utils/local-bridge';
import setAccessToken from '@common/utils/set-access-token';
import LoginHelper from '@common/utils/login-helper';

@inject('site')
@inject('user')
@inject('h5QrCode')
@inject('commonLogin')
@observer
class WeixinBindQrCodePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true
    }
  }

  timer = null;
  isDestroy = false;

  async componentDidMount() {
    const { wechatEnv, platform } = this.props.site;
    if (wechatEnv === 'miniProgram' && platform === 'h5') { // h5上不展示小程序码，用Scheme跳转
      return;
    }
    await this.generateQrCode();
  }

  componentWillUnmount() {
    this.isDestroy = true;
    clearInterval(this.timer);
  }

  async generateQrCode() {
    try {
      const { sessionToken = '', nickname = '', jumpType = '' } = this.props.router.query;
      const { platform, wechatEnv } = this.props.site;
      const qrCodeType = platform === 'h5' ? 'mobile_browser_bind' : 'pc_bind';
      const { user } = this.props;
      let name = nickname;
      if (user.loginStatus) {
        this.props.commonLogin.setUserId(user.id);
        name = user.nickname;
      }

      const redirectUri = `${wechatEnv === 'miniProgram' ? '/subPages/user/wx-auth/index' : `${window.location.origin}/user/wx-auth`}?loginType=${platform}&action=wx-bind&nickname=${name}`;
      await this.props.h5QrCode.generate({
        params: {
          sessionToken,
          type: wechatEnv === 'miniProgram' ? 'pc_bind_mini' : qrCodeType,
          redirectUri: encodeURIComponent(redirectUri),
          jumpType,
        },
      });
      // 组件销毁后，不执行后面的逻辑
      if (this.isDestroy) {
        return;
      }
      this.queryLoginState(wechatEnv === 'miniProgram' ? 'pc_bind_mini' : qrCodeType);
    } catch (e) {
      Toast.error({
        content: e.Message,
        hasMask: false,
        duration: 1000,
      });
    }
  }

  queryLoginState(type) {
    this.timer = setInterval(async () => {
      try {
        const res = await this.props.h5QrCode.bind({
          type,
          params: { sessionToken: this.props.h5QrCode.sessionToken },
        });
        const uid = get(res, 'data.uid');
        this.props.user.updateUserInfo(uid);
        // FIXME: 使用 window 跳转用来解决，获取 forum 在登录前后不同的问题，后续需要修改 store 完成
        window.location.href = '/';
        clearInterval(this.timer);
      } catch (e) {
        const { h5QrCode } = this.props;
        if (h5QrCode.countDown > 0) {
          h5QrCode.countDown = h5QrCode.countDown - 3;
        } else {
          clearInterval(this.timer);
        }
        this.errorHandler(e);
      }
    }, 3000);
  }

  errorHandler(e) {
    const { site, commonLogin, router } = this.props;
    if (e.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
      if (isExtFieldsOpen(site)) {
        commonLogin.needToCompleteExtraInfo = true;
        router.push('/user/supplementary');
        return;
      }
      return window.location.href = '/';
    }
    // 跳转状态页
    if (e.Code === BANNED_USER || e.Code === REVIEWING || e.Code === REVIEW_REJECT) {
      const uid = get(e, 'uid', '');
      uid && this.props.user.updateUserInfo(uid);
      commonLogin.setStatusMessage(e.Code, e.Message);
      router.push(`/user/status?statusCode=${e.Code}&statusMsg=${e.Message}`);
    }
  }

  handleSkipWechatButtonClick = async () => {
    const loginToken = this.props.commonLogin.getLoginToken();
    if (loginToken) {
      const dzqUserId = locals.get('dzq_user_id');
      dzqUserId && this.props.user.updateUserInfo(dzqUserId);
      setAccessToken({
        accessToken: loginToken,
      });
      LoginHelper.gotoIndex();
    }
  };

  onOkClick = async () => {
    this.props.commonLogin.needToBindMini = true;
    const { sessionToken, jumpType } = this.props.router.query;
    const resp = await genMiniBindScheme({
      params: {
        type: 'bind_mini',
        query: {
          scene: sessionToken,
          jumpType
        }
      }
    });
    if (resp.code === 0) {
      this.setState({
        visible: false
      });
      window.location.href = `${get(resp, 'data.openLink', '')}&sessionToken=${sessionToken}`;
      return;
    }
    Toast.error({
      content: '网络错误',
      hasMask: false,
      duration: 1000,
    });
  }

  onCancel = () => {
    this.setState({
      visible: false
    });
  }

  render() {
    const { site: { wechatEnv, platform }, router, h5QrCode } = this.props;
    const { nickname, isSkip = false } = router.query;
    return (
      <PcBodyWrap>
      <div className={platform === 'h5' ? layout.container : layout.pc_container}>
        {
          platform === 'h5'
            ? <HomeHeader hideInfo mode='login'/>
            : <Header/>
        }
        <div className={platform === 'h5' ? layout.content : layout.pc_content}>
          <div className={platform === 'h5' ? layout.title : layout.pc_title}>绑定微信号</div>
          <div className={platform === 'h5' ? layout.tips : layout.pc_tips}>
            {nickname ? `${nickname}，` : ''}请绑定您的微信
          </div>
          {/* 二维码 start */}
          <WeixinQrCode
            refresh={() => {this.generateQrCode()}}
            isValid={h5QrCode.isQrCodeValid}
            orCodeImg={h5QrCode.qrCode}
            orCodeTips={platform === 'h5' ? '长按保存二维码，并在微信中识别此二维码，即可完成登录' : '请使用微信，扫码登录'}
          />
          {/* 二维码 end */}
          { isSkip && <span className={layout.skip} onClick={this.handleSkipWechatButtonClick}>跳过</span> }
        </div>
      </div>
      { wechatEnv === 'miniProgram' && platform === 'h5' && <SkipMiniPopup visible={this.state.visible} onOkClick={this.onOkClick} onCancel={this.onCancel}/> }
      </PcBodyWrap>
    );
  }
}

export default withRouter(WeixinBindQrCodePage);
