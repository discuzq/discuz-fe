import React from 'react';
import RedPacketRanking from '@components/user-center/red-packet-ranking';
import { inject, observer } from 'mobx-react';
import BaseLayout from '@components/base-layout';


function Ranking (props) {
  const { pageText = '', invite } = props;
  // 加载更多函数
  const loadMore = async () => {
    if (!this.checkLoadCondition()) return;
    return await invite.getInviteUsersList(invite.currentPage + 1);
  };
  return (
    <BaseLayout
      showHeader={false}
      onRefresh={loadMore}
      showRefresh={false}
      isShowLayoutRefresh={false}
      hideCopyright
    >
      <RedPacketRanking {...props}/>
    </BaseLayout>

  );
}

export default inject('user', 'invite')(observer(Ranking));
