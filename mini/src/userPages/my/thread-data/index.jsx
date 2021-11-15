import React from 'react';
import { inject, observer } from 'mobx-react';
import ThreadData from '@layout/my/thread-data';
import Page from '@components/page';
import Taro from '@tarojs/taro';
@inject('site')
@inject('search')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props);
    Taro.hideShareMenu();
  }

  render() {
    return (
      <Page>
        <ThreadData />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default Index;
