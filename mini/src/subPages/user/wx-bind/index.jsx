import React, { Component } from 'react';
import Taro, { getCurrentInstance, redirectTo, navigateTo  } from '@tarojs/taro';
import { View, Navigator, Text } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import Button from '@discuzq/design/dist/components/button/index';
import Toast from '@discuzq/design/dist/components/toast/index';
// import { ToastProvider } from '@discuzq/design/dist/components/toast/ToastProvider';
import Page from '@components/page';
import { get } from '@common/utils/get';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, checkUserStatus, isExtFieldsOpen } from '@common/store/login/util';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';
import LoginHelper from '@common/utils/login-helper';
import setAccessToken from '@common/utils/set-access-token';
import { getParamCode, getUserProfile } from '../common/utils';
import layout from './index.module.scss';
// const MemoToastProvider = React.memo(ToastProvider);

@inject('site')
@inject('user')
@inject('miniBind')
@inject('h5QrCode')
@inject('commonLogin')
@observer
class WXBind extends Component {
  constructor(props) {
    super(props);
    this.handleBindButtonClick = this.handleBindButtonClick.bind(this);
    this.state = {
      status: ''
    }
  }

  async componentDidMount() {
    await getParamCode(this.props.commonLogin);
  }

  componentWillUnmount() {
    this.props.commonLogin.reset();
  }

  getUserProfileCallback = async (params) => {
    const { scene: sessionToken, bindPhone = '', loginType, jumpType } = getCurrentInstance().router.params;

    try {
      const res = await this.props.miniBind.mobilebrowserBind({
        jsCode: this.props.commonLogin.jsCode,
        iv: params.iv,
        encryptedData: params.encryptedData,
        sessionToken,
        type: loginType
      });
      this.props.commonLogin.setLoginLoading(true);
      checkUserStatus(res);
      if (res.code === 0) {
        this.props.h5QrCode.bindTitle = '已成功绑定';
        this.props.h5QrCode.isBtn = false;
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
        const userData = await this.props.user.updateUserInfo(uid);
        const mobile = get(userData, 'mobile', '');
        if (bindPhone && !mobile) { // 需要绑定手机，但是用户未绑定手机时，跳转到绑定手机页面
          redirectTo({ url: '/subPages/user/bind-phone/index' });
          return;
        }
        this.props.h5QrCode.bindTitle = '已成功绑定，正在跳转到首页';
        LoginHelper.gotoIndex();
        return;
      }
      if (res.code === 0) {
        return;
      }
      throw {
        Code: res.code,
        Message: res.msg,
      };
    } catch (error) {
      this.setState({
        status: 'error'
      });
      this.props.commonLogin.setLoginLoading(true);
      await getParamCode(this.props.commonLogin);
      // 注册信息补充
      if (error.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
        if (isExtFieldsOpen(this.props.site)) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
          redirectTo({ url: '/subPages/user/supplementary/index' });
          return;
        }
        LoginHelper.restore();
        return;
      }

      // 跳转状态页
      if (error.Code === BANNED_USER || error.Code === REVIEWING || error.Code === REVIEW_REJECT) {
        const uid = get(error, 'uid', '');
        uid && this.props.user.updateUserInfo(uid);
        this.props.commonLogin.setStatusMessage(error.Code, error.Message);
        navigateTo({
          url: `/subPages/user/status/index?statusCode=${error.Code}&statusMsg=${error.Message}`
        });
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

  handleBindButtonClick() {
    const { commonLogin } = this.props;
    if (!commonLogin.loginLoading) {
      return;
    }
    commonLogin.setLoginLoading(false);
    getUserProfile(this.getUserProfileCallback, true, async () => {
      commonLogin.setLoginLoading(true);
      await getParamCode(this.props.commonLogin);
    });
  }

  render() {
    const { nickname, jumpType = '' } = getCurrentInstance().router.params;
    const { status } = this.state;

    return (
      <Page>
        {/* <MemoToastProvider> */}
          <View className={layout.container}>
            <View className={layout.content}>
              <View className={layout.title}>绑定小程序</View>
              <View className={layout.tips}>
                {nickname ? `${nickname}，` : ''}{this.props.h5QrCode.bindTitle}
                { jumpType === '1' && status === 'success' && <Text>请返回原页面继续支付</Text>}
              </View>
              {
                this.props.h5QrCode.isBtn
                ? <Button
                  className={layout.button}
                  type="primary"
                  onClick={this.handleBindButtonClick}
                >
                  点此，绑定小程序，并继续访问
                </Button>
                : <></>
              }
              <Button className={layout.exit}>
                <Navigator openType='exit' target='miniProgram' className={layout.clickBtn} onClick={() => {
                  this.props.h5QrCode.bindTitle = '已取消绑定';
                  this.props.h5QrCode.isBtn = false;
                }}>
                  退出
                </Navigator>
              </Button>
            </View>
          </View>
        {/* </MemoToastProvider> */}
      </Page>
    );
  }
}

export default WXBind;
