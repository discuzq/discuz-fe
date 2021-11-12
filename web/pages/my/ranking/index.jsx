import React, { useEffect, useState } from 'react';
import RedPacketRanking from '@components/user-center/red-packet-ranking';
import RedPacketRankingPC from '@components/user-center/red-packet-ranking-pc';
import ViewAdapter from '@components/view-adapter';
import { useRouter } from 'next/router';

export default function index() {
  const [title, setTitle] = useState('');
  const router = useRouter();
  const params = (({ page }) => {
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
  })(router.query);

  useEffect(() => {
    const { pageText } = params;
    setTitle(`${pageText}领红包`);
  });

  return (
    <ViewAdapter
      h5={<RedPacketRanking {...params}/>}
      pc={<RedPacketRankingPC {...params} />}
      title={title}
    />
  );
}
