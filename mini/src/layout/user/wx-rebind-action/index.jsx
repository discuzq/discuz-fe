import React, { Component } from 'react';
import Taro, { getCurrentInstance, redirectTo, navigateTo  } from '@tarojs/taro';
import { View, Text, Navigator } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import Button from '@discuzq/design/dist/components/button/index';
import Toast from '@discuzq/design/dist/components/toast/index';
import Icon from '@discuzq/design/dist/components/icon/index';
import Avatar from '@discuzq/design/dist/components/avatar/index';
import Page from '@components/page';
import { get } from '@common/utils/get';
import LoginHelper from '@common/utils/login-helper';
import HomeHeader from '@components/home-header';
import styles from './index.module.scss';
import { getParamCode, getUserProfile } from '../../../subPages/user/common/utils';
// const MemoToastProvider = React.memo(ToastProvider);

@inject('site')
@inject('user')
@inject('commonLogin')
@observer
class WXRebindActionPage extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentStatus: '',
      errorTips: '扫码失败',
    };
  }
  getUserProfileCallback = async (params) => {
    const { scene: sessionToken } = getCurrentInstance().router.params;

    try {
      const { user, commonLogin } = this.props;
      await getParamCode(commonLogin);
      await user.rebindWechatMini({
        jsCode: commonLogin.jsCode,
        iv: params.iv,
        encryptedData: params.encryptedData,
        sessionToken,
      });
      this.setState({
        currentStatus: 'success'
      });
    } catch (e) {
      this.setState({
        currentStatus: 'error',
      });
      Toast.error({
        content: e.Msg || '扫码失败',
        hasMask: false,
        duration: 1000,
      });
    }
  }


  render() {
    const { currentStatus, errorTips } = this.state;
    const { nickname = '微信用户', avatarUrl = '' } = getCurrentInstance()?.router?.params || {};
    if (currentStatus) {
      return (
        <Page>
          <HomeHeader hideInfo hideMinibar mode="supplementary"/>
          <View className={styles.container}>
            <View className={`${styles.content} ${styles.statusContent}` }>
                { currentStatus === 'success' && <Icon color='#3AC15F' name="SuccessOutlined" size={80} className={styles.statusIcon} /> }
                { currentStatus === 'error' && <Icon color='#E02433' name="WrongOutlined" size={80} className={styles.statusIcon} /> }
                <Text className={styles.statusBottom}>{ currentStatus && (currentStatus === 'success' ? '扫码成功' : errorTips) }</Text>
            </View>
          </View>
        </Page>
      );
    }

    return (
      <Page>
        <HomeHeader hideInfo hideMinibar mode="supplementary"/>
        <View className={styles.container}>
          <View className={styles.content}>
            <View className={styles.title}>确认换绑微信</View>
            <View className={styles.tips}>
              <View>亲爱的用户，确认换绑微信？</View>
            </View>
            <Button
                className={styles.button}
                type="primary"
                onClick={() => {getUserProfile(this.getUserProfileCallback)}}
              >
              确认
            </Button>
          </View>
        </View>
      </Page>
    );
  }
}

export default WXRebindActionPage;