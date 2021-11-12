import React from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import BaseLayout from '@components/base-layout';
import RedPacketRankingPC from '@components/user-center/red-packet-ranking-pc';
import RenderRightPC from '@components/user-center/render-right-pc';
import { withRouter } from 'next/router';
import classNames from 'classNames';

function PankingPC(props) {
  const { pageText = '', invite, user, site } = props;

  // 加载更多函数
  const loadMore = async () => {
    if (!this.checkLoadCondition()) return;
    return await invite.getInviteUsersList(invite.currentPage + 1);
  };

  const renderRight = () => <RenderRightPC user={user} site={site}/>;

  return (
    <BaseLayout
      right={renderRight()}
      onRefresh={loadMore}
      showRefresh={false}
      isShowLayoutRefresh={false}
      rightClassName={classNames(styles.positionSticky, {
        'is-userinfo-show': true,
        'is-operate-show': false,
      })}
    >
      <RedPacketRankingPC {...props}/>
    </BaseLayout>
  );
}

export default inject('invite', 'user', 'site')(observer(withRouter(PankingPC)));
