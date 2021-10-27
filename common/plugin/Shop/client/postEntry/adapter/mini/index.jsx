import React from 'react';
import Taro, { eventCenter, getCurrentInstance } from '@tarojs/taro';
import { Icon, Dialog, Toast } from '@discuzq/design';

export default class ShopPostEntry extends React.Component {
  constructor(props) {
    super(props);
  }

  $instance = getCurrentInstance();

  handleIconClick = () => {
    const currentPluginStore = this.props.pluginAction.get('shop');

    if (currentPluginStore) {
      this.props.pluginAction.set('shop', {
        ...currentPluginStore,
        renderData: this.props.renderData,
      });
    } else {
      this.props.pluginAction.set('shop', {
        renderData: this.props.renderData,
      });
    }

    Taro.navigateTo({ url: '/pluginPages/selectProduct/index' });
  };

  isShowApplyIcon = () => {
    const { siteData, _pluginInfo } = this.props;
    const { pluginConfig } = siteData;
    if (!pluginConfig) return false;
    const [act] = (pluginConfig || []).filter(item => item.app_id === _pluginInfo.options.tomId);
    if (act?.authority?.canUsePlugin) return true;
    return false;
  };

  render() {
    if (!this.isShowApplyIcon()) return null;
    return (
      <>
        <Icon onClick={this.handleIconClick} name="ShoppingCartOutlined" size="20" />
      </>
    );
  }
}
