import React from 'react';
import WeixinBindQrCodePage from '@layout/user/h5/wx-bind-qrcode';
import { inject } from 'mobx-react';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCLoginMode from '@middleware/HOCLoginMode';

@inject('site')
class WeixinBind extends React.Component {
  render() {
    return <WeixinBindQrCodePage />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCLoginMode('weixin')(WeixinBind));
