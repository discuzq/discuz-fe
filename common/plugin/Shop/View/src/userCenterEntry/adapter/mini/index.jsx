import React from 'react';
import { View } from '@tarojs/components';
import { Icon } from '@discuzq/design';
import styles from '../index.module.scss';
import { navigateToMiniProgram } from '@tarojs/taro';
export default class UserCenterEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      miniShopConfig: {},
      visible: false,
    };
  }

  componentDidMount() {
    this.getMiniShopPluginConfig();
  }

  async getMiniShopPluginConfig() {
    const { _pluginInfo, siteData } = this.props;
    let pluginConfig = siteData?.pluginConfig || [];
    const miniShopConfig = pluginConfig.find((config) => config.app_id === _pluginInfo.options.tomId);
    const { webConfig: { other: { threadOptimize } } } = siteData;
    console.log('>>> siteData', siteData)

    // 后台开启了商店并且配置了商城相关配置，才显示商城
    if (threadOptimize && miniShopConfig?.setting?.publicValue?.wxAppId) {
      this.setState({
        visible: true,
        miniShopConfig,
      });
    }
  }

  handleMiniShopOpen = () => {
    const appId = this.state.miniShopConfig?.setting?.publicValue?.wxAppId;
    if (!appId) {
      return;
    }
    navigateToMiniProgram({ appId });
  };

  render() {
    const { visible } = this.state;
    return (
      <>
        { visible && (
          <View onClick={this.handleMiniShopOpen} className={`${styles.userCenterActionItem} ${styles.mini}`}>
            <View className={styles.userCenterActionItemIcon}>
              <Icon name="ShopOutlined" color="#4F5A70" size={20} />
            </View>
            <View className={styles.userCenterActionItemDesc}>商城</View>
          </View>
        )}
      </>
    );
  }
}
