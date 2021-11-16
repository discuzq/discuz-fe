import React from 'react';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import Sharedetail from '@layout/thread/sharedetail';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
// import { readWalletUser } from '@server';
import ViewAdapter from '@components/view-adapter';

@inject('site')
@observer
class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      walletData: null,
    };
  }

  componentDidMount() {
      
  }

  render() {
    return <ViewAdapter pc={null} h5={<Sharedetail />} title={'分享详情'} />;
  }
}

// eslint-disable-next-line new-cap
export default withRouter(HOCFetchSiteData(Page));
