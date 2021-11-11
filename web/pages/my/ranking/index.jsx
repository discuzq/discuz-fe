import React from 'react';
import RedPacketRanking from '@components/user-center/red-packet-ranking';
import RedPacketRankingPC from '@components/user-center/red-packet-ranking-pc';
import ViewAdapter from '@components/view-adapter';
import Redirect from '@components/redirect';

export default function index() {
  return (
    <ViewAdapter
      h5={<RedPacketRanking />}
      pc={<RedPacketRankingPC />}
      title={'红包'}
    />
  );
}
