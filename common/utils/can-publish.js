import loginHelper from './login-helper';
import Router from '@discuzq/sdk/dist/router';
/**
 * 判断是否可以发布内容
 */
export default function canPublish(userStore, siteStore) {
  if (!userStore.isLogin()) { // 是否登录
    loginHelper.gotoLogin();
    return false;
  }
  if (!siteStore.publishNeedBindPhone) { // 是否开启发帖需要绑定手机号
    return true;
  }
  const type = `${(siteStore.isSmsOpen && 'mobile') || ''}${siteStore.wechatEnv !== 'none' && 'wechat'}`;
  let url = '';
  switch (type) {
    case 'mobile': // 手机模式
      url = !userStore.mobile ? '/user/bind-phone' : '';
      break;
    case 'wechat': // 微信模式
      url = !userStore.isBindWechat ? '/user/wx-bind-qrcode' : '';
      break;
    case 'mobilewechat': // 手机 + 微信模式
      url = !userStore.isBindWechat && !userStore.mobile ? '/user/wx-bind-qrcode' : '';
      break;
  }
  url && loginHelper.setUrl(url);
  url && Router.push({url});
  return !url;
}
