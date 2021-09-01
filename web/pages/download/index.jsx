import React from 'react';
import { inject, observer } from 'mobx-react';
import { Toast } from '@discuzq/design';
import isWeiXin from '@common/utils/is-weixin';
import Router from '@discuzq/sdk/dist/router';
import { readDownloadAttachmentStatus } from '@server';
import goToLoginPage from '@common/utils/go-to-login-page';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import { downloadAttachment } from '@common/utils/download-attachment-web';
import { readThreadDetail } from '@server';


@inject('user')
@observer
class Download extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const { url } = this.props.router.query;
    if (!url) return;
    // 先判断是否登录
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (isWeiXin()) {
      Toast.info({ content: '暂不支持微信内下载' });
      Router.redirect({ url: '/' });
      return;
    }

    // 获取附件的下载链接，url中链接不全，从asPath中获取
    const { asPath } = this.props.router;
    const urlArr = decodeURI(asPath).split('?');
    const urlstr = `${urlArr[1].split('=')[1]}?${urlArr[2].split('&')[0]}&${urlArr[2].split('&')[1]}`;
    const paramArr = urlArr[2].split('&');
    const fileName = paramArr[2].split('=')[1];
    const threadId = paramArr[3].split('=')[1];

    const canDownloadAttachment = await this.getCanDownloadAttachment(threadId);
    if (!canDownloadAttachment) {
      Toast.warning({ content: '暂⽆权限下载附件' });
      Router.redirect({ url: '/' });
      return;
    }
    
    const params = {
      sign: paramArr[0].split('=')[1],
      attachmentsId: Number(paramArr[1].split('=')[1]),
      isCode: 1,
    }
    // 获取链接状态，先判断链接是否可以下载文件
    const isDownload = await this.downloadAttachmentStatus(params);
    if (isDownload) {
      downloadAttachment(urlstr, fileName); // 下载文件
    }
    
  }

  // 获取帖子详情，判断是否有权限下载
  async getCanDownloadAttachment(id) {
    const res = await readThreadDetail({ params: { threadId: Number(id) } });
    if (res.code === 0) {
      return res?.data?.ability?.canDownloadAttachment;
    }
  }

  // 获取链接状态
  async downloadAttachmentStatus(params) {
    const res = await readDownloadAttachmentStatus(params);

    if (res?.code === 0) {
      // 弹出下载弹框
      Router.redirect({ url: '/' });
      return true;
    }

    if (res?.code === -7083) {  // 超过今天可下载附件的最大次数
      Toast.info({ content: res?.msg });
      Router.redirect({ url: '/' });
    }

    if (res?.code === -7082) {  // 下载资源已失效
      Toast.info({ content: res?.msg });
      Router.redirect({ url: '/' });
    }

    if (res?.code === -4004) {  // 资源不存在
      Toast.info({ content: res?.msg });
    }
    return false;
  }
  
  render() {
    return <div></div>;
  }
}
export default HOCFetchSiteData(Download);