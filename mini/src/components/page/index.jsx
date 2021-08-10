import React from 'react';
import { observer, inject } from 'mobx-react';
import { View, Navigator } from '@tarojs/components';
import styles from './index.module.scss';
import Icon from '@discuzq/design/dist/components/icon/index';
import Popup from '@discuzq/design/dist/components/popup/index'
import Button from '@discuzq/design/dist/components/button/index';;
import Router from '@discuzq/sdk/dist/router';
import { getCurrentInstance } from '@tarojs/taro';
import PayBoxProvider from '@components/payBox/payBoxProvider';
import { MINI_SITE_JOIN_WHITE_LIST, REVIEWING_USER_WHITE_LIST } from '@common/constants/site';
import { ToastProvider } from '@discuzq/design/dist/components/toast/ToastProvider';
import Taro from '@tarojs/taro';
import { REVIEWING } from '@common/store/login/util';
import LoginHelper from '@common/utils/login-helper';

const INDEX_URL = '/indexPages/home/index';
const PARTNER_INVITE_URL = '/subPages/forum/partner-invite/index';
const BIND_NICKNAME_URL = '/subPages/user/bind-nickname/index';
const CLOSE_URL = '/subPage/close/index';
const PAGE_404_URL = '/subPages/404/index';
const PAGE_500_URL = '/subPages/500/index';
const STATUS_URL = '/subPages/user/status/index'; // 用户状态提示页

@inject('user')
@inject('site')
@inject('commonLogin')
@observer
export default class Page extends React.Component {
  static defaultProps = {
    withLogin: false,
    noWithLogin: false,
    disabledToast: false,
  };

  // 检查是否满足渲染条件
  isPass(noWait = false) {
    const { noWithLogin, withLogin, site, user, commonLogin } = this.props;
    const path = getCurrentInstance().router.path;
    const siteMode = site?.webConfig?.setSite?.siteMode;

    if (!site.isMiniProgramOpen) {
      return false;
    }

    // 是否必须登录
    if (withLogin && !user.isLogin()) {
      LoginHelper.saveAndLogin();
      return false;
    }

    // 是否必须不登录
    if (noWithLogin && user.isLogin()) {
      Router.redirect({ url: INDEX_URL });
      return false;
    }

    if (site?.webConfig) {
      // 关闭站点
      if (path !== CLOSE_URL && site.closeSiteConfig) {
        Router.replace({ url: CLOSE_URL });
        return false;
      }

      // 付费模式处理
      if (siteMode === 'pay') {
        // 已付费用户，恢复页面
        if (path === PARTNER_INVITE_URL && user.paid) {
          LoginHelper.restore(false);
          return false;
        }

        // 未付费用户访问非白名单页面，强制跳转付费页
        if (path !== PARTNER_INVITE_URL && !MINI_SITE_JOIN_WHITE_LIST.includes(path)) {
          if (!user.userInfo && !noWait) {
            // 此时可能用户信息加载中。延时1000ms再检查一次
            setTimeout(() => {
              this.isPass(true);
            }, 1000);
            return false;
          } else if (!user.paid) {
            Router.replace({ url: PARTNER_INVITE_URL });
            return false;
          }
        }
      }

      // TODO: 强制绑定方案待定
      if (user.isLogin()) {
        // // 绑定微信：开启微信，没有绑定微信
        // if ((site.isOffiaccountOpen || site.isMiniProgramOpen) && path !== '/subPages/user/wx-bind-qrcode/index' && !user.isBindWechat) {
        //   Router.redirect({url: '/subPages/user/wx-bind-qrcode/index'});
        //   return false;
        // }
        // 前置：没有开启微信
        if (!site.isOffiaccountOpen && !site.isMiniProgramOpen) {
          // 绑定昵称：没有开启短信，也没有绑定昵称
          if (path !== BIND_NICKNAME_URL && !user.nickname) {
            Router.replace({ url: BIND_NICKNAME_URL });
            return false;
          }
        }

        // 账号审核中的 用户只能访问 首页 + 帖子详情页，以及用户状态提示页
        if (user.userStatus === REVIEWING) {
          if (!REVIEWING_USER_WHITE_LIST.includes(path)) {
            Router.replace({ url: `${STATUS_URL}?statusCode=${user.userStatus}` });
            return false;
          }
        }
      }

      // 跳转指定页面后清空记录
      const jumpUrl = LoginHelper.getUrl();
      if (jumpUrl?.includes(path)) {
        LoginHelper.clear();
      }
    }

    return true;
  }

  createContent() {
    const { children, site } = this.props;
    const routerList = Taro.getCurrentPages();
    const currRouter = routerList[routerList.length - 1];
    if (currRouter) {
      const path = currRouter.route;
      if (path === INDEX_URL || path === PAGE_404_URL || path === PAGE_500_URL) {
        return children;
      }
    }

    if (!site.webConfig && !site.closeSiteConfig) {
      return (
        <View className={styles.loadingBox}>
          <Icon className={styles.loading} name="LoadingOutlined" size="large" />
        </View>
      );
    }
    return children;
  }

  render() {
    if (!this.props.site.isMiniProgramOpen) {
      return (
        <Popup position="center" visible={true} onClose={()=> {}}>
          <View className={styles.container}>
            <View className={styles.deleteTips}>
              <View className={styles.tips}>提示</View>
              <View className={styles.content}>管理员未开启小程序配置，暂不支持小程序访问</View>
            </View>
            <View className={styles.btn}>
              <Button type='primary' className={styles.exit} onClick={() => {}}>
                <Navigator openType='exit' target='miniProgram' className={styles.navigator}>
                  关闭
                </Navigator>
              </Button>
            </View>
          </View>
        </Popup>
      );
    }

    // 如果被劫持到其它页面，则不展示当前页
    if (!this.isPass()) {
      return null;
    }

    const { site, disabledToast, className = '' } = this.props;
    return (
      <View className={`${styles['dzq-page']} dzq-theme-${site.theme} ${className}`}>
        <PayBoxProvider>{this.createContent()}</PayBoxProvider>
        {!disabledToast && <ToastProvider></ToastProvider>}
      </View>
    );
  }
}
