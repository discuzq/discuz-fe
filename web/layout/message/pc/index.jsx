import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import styles from './index.module.scss';
import MessageAccount from '@components/message/message-account';
import MessageIndex from '@components/message/message-index';
import MessageThread from '@components/message/message-thread';
import MessageFinancial from '@components/message/message-financial';
import MessageChat from '@components/message/message-chat';
import BaseLayout from '@components/base-layout';
import SidebarPanel from '@components/sidebar-panel';
import Copyright from '@components/copyright';
import UserCenterFollow from '@components/user-center-follow';
import Router from '@discuzq/sdk/dist/router';
import Stepper from '../../search/pc/components/stepper';

const Index = ({ page, subPage, dialogId, username }) => {
  const router = useRouter();

  const [sidebarIndex, setSidebarIndex] = useState(9999);

  const sidebarData = [
    {
      iconName: "StrongSharpOutlined",
      iconColor: "#2469f6",
      content: "我的私信",
      type: 'index',
    },
    {
      iconName: "MemberOutlined",
      iconColor: "#3AC15F",
      content: "帖子通知",
      type: 'thread',
    },
    {
      iconName: "HotOutlined",
      iconColor: "#FFC300",
      content: "财务通知",
      type: 'financial',
    },
    {
      iconName: "HotOutlined",
      iconColor: "#E02433",
      content: "账号消息",
      type: 'account',
    }
  ];

  const mainContent = useMemo(() => {
    // 处理侧边栏选中状态
    const p = page === 'chat' ? 'index' : page;
    sidebarData.forEach((item, i) => {
      if (item.type === p) {
        console.log(i);
        setSidebarIndex(i);
      }
    });

    // 处理页面主内容切换
    switch (page) {
      case 'index':
        return <MessageIndex />;
      case 'account':
        return <MessageAccount subPage={subPage} />;
      case 'thread':
        return <MessageThread />;
      case 'financial':
        return <MessageFinancial />;
      case 'chat':
        return <MessageChat dialogId={dialogId} username={username} />;
    }
  }, [page, subPage, dialogId, username]);

  const rightContent = () => {
    return (
      <div className={styles.rightside}>
        <div className={styles['stepper-container']}>
          <Stepper onItemClick={sidebarClick} selectIndex={sidebarIndex} data={sidebarData} />
        </div>

        <SidebarPanel
          type="normal"
          isNoData={99 === 0}
          title="关注"
          leftNum={99}
          onShowMore={() => {}}
        >
          {99 !== 0 && (
            <UserCenterFollow
              style={{
                overflow: 'hidden',
              }}
              // className={styles.friendsWrapper}
              limit={5}
            />
          )}
        </SidebarPanel>
        <Copyright />
      </div>
    );
  };

  const sidebarClick = (_index, _iconName, item) => {
    router.replace(`/message?page=${item.type}`);
  }


  return (
    <BaseLayout
      // onSearch={this.onSearch}
      // onRefresh={this.onPullingUp}
      // noMore={currentPage >= totalPage}
      // onScroll={this.onScroll}
      // showRefresh={false}
      // left={ this.renderLeft(countThreads) }
      right={rightContent}
    >
      {mainContent}
    </BaseLayout>
  );

};

export default Index;
