import React, { useEffect } from 'react';
import Page from '@components/page';
import { getCurrentInstance } from '@tarojs/taro';
import RedPacketRanking from '@components/user-center/red-packet-ranking';
import setTitle from '@common/utils/setTitle';

export default function Index() {
  const { router } = getCurrentInstance();
  console.log(router)

  const params = (({ page = '' }) => {
    let pageText = '';
    switch (page) {
      case 'praise':
        pageText = '集赞';
        break;
      case 'comment':
        pageText = '评论';
        break;
      case 'share':
        pageText = '分享';
        break;
    }
    return { page, pageText };
  })(router.params);

  useEffect(() => {
    const { pageText } = params;
    setTitle(`${pageText}领红包`);
  });

  return (
    <Page>
      <RedPacketRanking {...params} />
    </Page>
  );
}
