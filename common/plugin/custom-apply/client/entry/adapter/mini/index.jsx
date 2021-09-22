import React from 'react';
import { View, Text } from '@tarojs/components';
import { Icon, Dialog, Toast } from '@discuzq/design';
import CustomApplyEntryContent from './content';
import { getPostData } from '@common/plugin/custom-apply/client/common';
import { PLUGIN_TOMID_CONFIG } from '@common/plugin/plugin-tomid-config';
import classNames from 'classnames';
import styles from '../index.module.scss';

export default class CustomApplyEntry extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      body: {},
    };
  }

  change = (body) => {
    this.setState({ body });
  };

  handleDialogOpen = () => {
    const { siteData } = this.props;
    const { navInfo = {} } = siteData.threadPost || {};
    const navStyle = {
      marginTop: `${navInfo.statusBarHeight}px`,
      height: `${navInfo.navHeight}px`,
    };
    Dialog.confirm({
      isNew: true,
      className: classNames(styles['dzqp-act'], styles.h5, styles.mini),
      headerStyle: navStyle,
      title: '创建活动报名',
      content: <CustomApplyEntryContent {...this.props} onChange={this.change} />,
      onConfirm: this.handleDialogConfirm,
    });
  };

  handleDialogConfirm = () => {
    const { body } = this.state;
    if (!body.activityStartTime || !body.activityEndTime) {
      Toast.info({ content: '活动开始时间和结束时间必填' });
      return false;
    }
    const postData = getPostData(body);
    this.props.onConfirm({ postData });
    Dialog.hide();
  };

  isShowApplyIcon = () => {
    const { siteData } = this.props;
    const { pluginConfig } = siteData;
    if (!pluginConfig) return false;
    const [act] = (pluginConfig || []).filter(item => item.app_id === PLUGIN_TOMID_CONFIG.apply);
    if (act?.authority?.canUsePlugin) return true;
    return false;
  };

  render() {
    if (!this.isShowApplyIcon()) return null;
    return (
      <>
        <Icon
          onClick={this.handleDialogOpen}
          name="ApplyOutlined"
          size="20"
        />
      </>
    );
  }
}
