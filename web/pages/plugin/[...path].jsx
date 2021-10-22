/* eslint-disable spaced-comment */
/* eslint-disable new-cap */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import DZQPluginCenterInjectionPolyfill from '../../utils/DZQPluginCenterInjectionPolyfill';

// 插件插槽埋入
/**DZQ->plugin->register<plugin_system@add_page_hook>**/

@inject('site')
@inject('user')
@inject('plugin')
@observer
class PagePlugin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pluginPath: `/${this.props.router.query.path.join('/')}`,
    };
  }

  getTargetPlugin = () => {
    return (<DZQPluginCenterInjectionPolyfill
          target='plugin_system' 
          hookName='add_page_hook'
          condition={(pluginInfo) => {
            return pluginInfo.path === this.state.pluginPath
          }}
    />)
  }

  renderTargetPlugin = () => {
    const targetPlugins = this.getTargetPlugin();
    return targetPlugins;
  }

  render() {
    return this.renderTargetPlugin();
  }
}

export default withRouter(HOCFetchSiteData(PagePlugin));
