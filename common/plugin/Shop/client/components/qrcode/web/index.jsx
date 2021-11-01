import React from 'react';
import { Icon } from '@discuzq/design';
import styles from '../index.module.scss';

export default class Qrcode extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      miniShopConfig: {},
    };
  }

  componentDidMount() {
    this.getMiniShopPluginConfig();
  }

  async openMiniShop(miniShopConfig) {
    if (miniShopConfig?.setting?.wxScheme) {
      window.location.href = miniShopConfig.setting.wxScheme;
    }
  }

  async getMiniShopPluginConfig() {
    const { _pluginInfo, siteData } = this.props;
    let pluginConfig = siteData?.pluginConfig || [];
    const miniShopConfig = pluginConfig.find((config) => config.app_id === _pluginInfo.options.tomId);
    siteData.platform === 'h5' && this.openMiniShop(miniShopConfig);
    this.setState({
      miniShopConfig,
    });
  }

  render() {
    const { miniShopConfig } = this.state;
    const { siteData } = this.props;
    return (
      <div className={styles['dzq-qrcode-box']}>
        <img className={styles['dzq-qrcode-img']} src={miniShopConfig?.setting?.wxQrcode} />
        {siteData.platform === 'pc' ? (
          <span className={`${styles['dzq-qrcode-msg']} ${styles.pc}`}>
            <Icon name="ScanOutlined" size={16} className={styles['dzq-qrcode-scan-icon']} />
            扫码访问商城
          </span>
        ) : (
          <span className={`${styles['dzq-qrcode-msg']} ${styles.h5}`}>
            <span>长按保存二维码</span>
            <span>使用微信扫码访问</span>
          </span>
        )}
      </div>
    );
  }
}
