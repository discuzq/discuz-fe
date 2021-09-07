import loginHelper from './login-helper';
/**
 * 判断是否可以发布内容
 */
export default function canPublish(userStore, siteStore) {
  if (!userStore.isLogin()) { // 是否登录
    loginHelper.saveAndLogin();
    return false;
  }
  if (!siteStore.publishNeedBindPhone && !siteStore.publishNeedBindWechat) { // 如果没有开启发帖需要绑定手机或者微信，则不做逻辑处理
    return true;
  }
  const type = `bind${siteStore.publishNeedBindPhone && !userStore.mobile ? 'Mobile' : ''}${siteStore.publishNeedBindWechat && !userStore.isBindWechat ? 'Wechat' : ''}`;
  const mode = `${(siteStore.isSmsOpen && 'mobile') || ''}${(siteStore.wechatEnv !== 'none' && 'wechat') || ''}`;
  let url = '';
  switch (mode) {
    case 'mobile': // 手机模式
      url = !userStore.mobile ? '/user/bind-phone' : '';
      break;
    case 'wechat': // 微信模式
      url = !userStore.isBindWechat ? '/user/wx-bind-qrcode' : '';
      break;
    case 'mobilewechat': // 手机 + 微信模式
      switch (type) {
        case 'bindMobile': // 需要绑定手机
          url = !userStore.mobile ? '/user/bind-phone' : '';
          break;
        case 'bindWechat': // 需要绑定微信
          url = !userStore.isBindWechat ? '/user/wx-bind-qrcode' : '';
          break;
        case 'bindMobileWechat': // 需要绑定手机和微信
          url = !userStore.isBindWechat && !userStore.mobile ? '/user/wx-bind-qrcode?bindPhone=1' : '';
          break;
      }
      break;
  }
  url && loginHelper.saveAndPush(url);
  return !url;
}
