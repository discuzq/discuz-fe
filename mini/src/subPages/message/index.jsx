import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import Page from '@components/page';
import Message from '@layout/message';
import { getCurrentInstance } from '@tarojs/taro';

/**
* ��Ϣҳ�浱ǰ��ʾ����Ϣģ��
*
* �ӵ�ǰ·�� params������ȡֵpage��subPage��dialogId
* page=index: ��Ϣ��ҳ
* page=thread: ����֪ͨ��subPage=at/reply/likeΪ����֪ͨ��@�ҵġ��ظ��ҵġ������ҵ�3����ҳ��
* page=financial: ����֪ͨ
* page=account: �˺���Ϣ
* page=chat: ����Ի���dialogId=xxxΪ��ǰ�Ի�id��usernameΪ����Է����û���
*
*/
const Index = inject('message')(observer(({ message }) => {
  // ·��
  const { router } = getCurrentInstance();

  // ��������
  const params = (({ page, subPage, dialogId, username }) => {
    if (!['index', 'thread', 'financial', 'account', 'chat'].includes(page)) {
      page = 'index';
    }

    if (!['at', 'reply', 'like'].includes(subPage)) {
      subPage = '';
    }

    return { page, subPage, dialogId, username };
  })(router.params);

  // ����δ����Ϣ
  useEffect(() => {
    message.readUnreadCount();
  });

  console.log('params :>> ', params);

  return (
    <Page>
      <Message {...params} />
    </Page>
  );
}));

export default Index;