import React from 'react';
import { Icon } from '@discuzq/design';
import { inject, observer } from 'mobx-react';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import getQueryString from '@common/utils/get-query-string';
import HomeHeader from '@components/home-header';
import styles from './index.module.scss';
import browser from '@common/utils/browser';

@inject('payBox')
@observer
class PayMiddlePage extends React.Component {
  componentDidMount = async () => {
    const link = getQueryString('link');

    if (!link) return;

    // UC 浏览器使用 iframe 有兼容性问题，使用直接跳转
    if (browser.env('uc')) {
      const parsedLink = decodeURIComponent(link);
      window.location.href = parsedLink;
    } else {
      const parsedLink = decodeURIComponent(link);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.setAttribute('src', parsedLink);
      iframe.setAttribute('sandbox', 'allow-top-navigation allow-scripts');
      document.body.appendChild(iframe);
    }

    // FIXME: SSR下的情况，状态会丢失，需要寻找一种解决办法
    // CSR 的情况下，打开确认支付结果窗口
    setTimeout(() => {
      this.props.payBox.h5SureDialogVisible = true;
      this.props.payBox.visible = true;

      // uc 浏览器使用 link，这里主动进行回退一次
      if (browser.env('uc')) {
        window.location.back();
      }
    }, 500);
  };

  render() {
    return (
      <div>
        <HomeHeader mode={'login'} hideInfo={true} />
        <div className={styles.payMiddlePagecontent}>
          <div className={styles.infoText}>
            <Icon name="FunnelOutlined" size={16} />
            正在拉起微信支付
          </div>
        </div>
      </div>
    );
  }
}

export default HOCFetchSiteData(PayMiddlePage);
