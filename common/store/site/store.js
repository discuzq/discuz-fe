import { observable, computed } from 'mobx';
import { APP_THEME } from '@common/constants/site';
import { get } from '../../utils/get';
import { DOMAIN_WHITE_LIST } from '../../constants/site';

const WECHAT_ENV_MAP = {
  MINI: 'miniProgram',
  OPEN: 'openPlatform',
  NONE: 'none',
};

class SiteStore {
  constructor(props = {}) {
    this.envConfig = props.envConfig;
    this.webConfig = props.webConfig;
    this.platform = props.platform;
  }

  envConfig = {};
  @observable webConfig = null;
  @observable platform = null;
  @observable closeSiteConfig = null;
  @observable theme = APP_THEME.light;
  @observable isUserLoginVisible = null;
  @observable errPageType = null;
  @computed get isRegister() {
    return !this.isSmsOpen && this.wechatEnv === 'none' && this.registerClose;
  }

  @computed get isPC() {
    return this.platform === 'pc';
  }

  @computed get isDomainWhiteList() {
    const COMMON_BASE_URL = get(this.envConfig, 'COMMON_BASE_URL', '');
    return COMMON_BASE_URL === DOMAIN_WHITE_LIST ;
  }

  @computed get isSmsOpen() {
    return get(this.webConfig, 'qcloud.qcloudSms', false);
  }

  @computed get isMiniProgramOpen() {
    return Boolean(get(this.webConfig, 'passport.miniprogramOpen', true));
  }
  // 发布帖子时是否需要绑定手机
  @computed get publishNeedBindPhone() {
    return Boolean(get(this.webConfig, 'other.publishNeedBindPhone', false));
  }

  // 发布帖子时是否需要绑定微信
  @computed get publishNeedBindWechat() {
    return Boolean(get(this.webConfig, 'other.publishNeedBindWechat', false));
  }

  // 公众平台是否开启
  @computed get isOffiaccountOpen() {
    return Boolean(get(this.webConfig, 'passport.offiaccountOpen', true));
  }

  // 站点 icon 路径
  @computed get siteIconSrc() {
    return get(this.webConfig, 'setSite.siteLogo');
  }

  // 站点名称
  @computed get siteName() {
    return get(this.webConfig, 'setSite.siteName');
  }

  // 站点介绍
  @computed get siteIntroduction() {
    return get(this.webConfig, 'setSite.siteIntroduction') || '暂无介绍';
  }

  // 注册协议开关
  @computed get isAgreementRegister() {
    return get(this.webConfig, 'agreement.register', true);
  }

  // 注册协议内容
  @computed get agreementRegisterContent() {
    return get(this.webConfig, 'agreement.registerContent', '');
  }

  // 注册协议内容
  @computed get registerClose() {
    return get(this.webConfig, 'setReg.registerClose', '');
  }

  // 隐私协议开关
  @computed get isAgreementPrivacy() {
    return get(this.webConfig, 'agreement.privacy', true);
  }

  // 隐私协议内容
  @computed get agreementPrivacyContent() {
    return get(this.webConfig, 'agreement.privacyContent', '');
  }

  @computed get cashMinSum() {
    return get(this.webConfig, 'setCash.cashMinSum', 1);
  }

  @computed get wechatEnv() {
    if (this.isMiniProgramOpen) {
      return WECHAT_ENV_MAP.MINI;
    }

    if (this.isOffiaccountOpen) {
      return WECHAT_ENV_MAP.OPEN;
    }

    return WECHAT_ENV_MAP.NONE;
  }

  // 是否开通的云点播
  @computed get isOpenQcloudVod() {
    return get(this.webConfig, 'qcloud.qcloudVod', false);
  }

  // 是否开启了微信支付
  @computed get isWechatPayOpen() {
    return get(this.webConfig, 'paycenter.wxpayClose', false);
  }

  // IOS 微信支付是否允许
  @computed get isIOSWechatPayOpen() {
    return get(this.webConfig, 'paycenter.wxpayIos', false);
  }
}

export default SiteStore;
