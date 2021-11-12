import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';
import BaseLayout from '@components/base-layout';
import RedPacketRanking from '@components/user-center/red-packet-ranking';
import styles from './index.module.scss';

function RankingH5(props) {
  const { pageText = '', invite } = props;

  // 加载更多函数
  const loadMore = async () => {
    if (!this.checkLoadCondition()) return;
    return await invite.getInviteUsersList(invite.currentPage + 1);
  };

  return (
    <BaseLayout
      onRefresh={loadMore}
      showRefresh={false}
      isShowLayoutRefresh={false}
      hideCopyright
    >
      <RedPacketRanking {...props}/>
    </BaseLayout>
  );
}

export default inject('user', 'invite')(observer(RankingH5));
