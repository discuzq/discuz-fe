import React from 'react';
import Taro, { getCurrentInstance, redirectTo  } from '@tarojs/taro';
import { inject } from 'mobx-react';
import Toast from '@discuzq/design/dist/components/toast/index';
import Popup from '@discuzq/design/dist/components/popup/index';
import { Button, View } from '@tarojs/components';
import { miniLogin } from '@server';
import setAccessToken from '@common/utils/set-access-token';
import { BANNED_USER, REVIEWING, REVIEW_REJECT, checkUserStatus, isExtFieldsOpen } from '@common/store/login/util';
import Page from '@components/page';
import { getParamCode, getUserProfile } from '../common/utils'
import layout from './index.module.scss';
import { MOBILE_LOGIN_STORE_ERRORS } from '@common/store/login/mobile-login-store';

const NEED_BIND_OR_REGISTER_USER = -7016;
@inject('site')
@inject('user')
@inject('commonLogin')
@inject('invite')
class MiniAuth extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isVisible: true
    }
  }
  async componentDidMount() {
    const { action, sessionToken } = getCurrentInstance().router.params;
    await getParamCode(this.props.commonLogin)
    // 其他地方跳入的小程序绑定流程
    if(action === 'mini-bind'){
      redirectTo({
        url: `/subPages/user/wx-bind/index?sessionToken=${sessionToken}`
      })
    }
  }

  getUserProfileCallback = async (params) => {
    let { inviteCode } = getCurrentInstance().router.params;
    inviteCode = inviteCode || this.props.invite.getInviteCode()
    const avatarUrl = params?.userInfo?.avatarUrl;
    const nickName = params?.userInfo?.nickName;
    const { commonLogin } = this.props;
    commonLogin.setAvatarUrl(avatarUrl);
    commonLogin.setNickname(nickName);
    try {
      // 小程序登录
      const resp = await miniLogin({
        timeout: 10000,
        data: {
          jsCode: this.props.commonLogin.jsCode,
          iv: params.iv,
          encryptedData: params.encryptedData,
          inviteCode
        },
      });
      checkUserStatus(resp);
      // 优先判断是否能登录
      if (resp.code === 0) {
        const { accessToken, uid } = resp.data;
        setAccessToken({
          accessToken,
        });
        this.props.user.updateUserInfo(uid);
        redirectTo({
          url: `/pages/index/index`
        });
        return;
      }
      // 落地页开关打开
      if (resp.code === NEED_BIND_OR_REGISTER_USER) {
        const { sessionToken } = resp.data;
        redirectTo({
          url: `/subPages/user/wx-select/index?sessionToken=${sessionToken}&nickname=${nickName}`
        });
        return;
      }

      throw {
        Code: resp.code,
        Message: resp.msg,
      };
    } catch (error) {
      // 注册信息补充
      if (error.Code === MOBILE_LOGIN_STORE_ERRORS.NEED_COMPLETE_REQUIRED_INFO.Code) {
        if (isExtFieldsOpen(this.props.site)) {
          this.props.commonLogin.needToCompleteExtraInfo = true;
          redirectTo({ url: '/subPages/user/supplementary/index' });
          return;
        }
        redirectTo({ url: '/pages/index/index' });
        return;
      }
      // 跳转状态页
      if (error.Code === BANNED_USER || error.Code === REVIEWING || error.Code === REVIEW_REJECT) {
        this.props.commonLogin.setStatusMessage(error.Code, error.Message);
        redirectTo({
          url: `/subPages/user/status/index?statusCode=${error.Code}&statusMsg=${error.Message}`
        });
        return;
      }
      if (error.Code) {
        Toast.error({
          content: error.Message,
        });
      }
      throw {
        Code: error.Code,
        Message:  error.Message,
        error,
      };
    }
  }

  render() {
    return (
      <Page>
        <Popup
          position="bottom"
          visible={this.state.isVisible}
        >
          <View  className={layout.modal} >
            <Button className={layout.button} onClick={() => {getUserProfile(this.getUserProfileCallback)}}>微信快捷登录</Button>
          </View>
        </Popup>
      </Page>
      );
  }
}

export default MiniAuth;
