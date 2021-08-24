import React from 'react';
import { ActionSheet } from '@discuzq/design';
import isWeiXin from '@common/utils/is-weixin';
const index = ({ onClose, handleWxShare, handleH5Share, show, createCard, fromThread }) => {
  const actions = [
    {
      icon: 'PictureOutlinedBig',
      description: '生成海报',
    },
    {
      icon: 'PaperClipOutlined',
      description: '复制链接',
    },
  ];
  if (isWeiXin() && !fromThread) {
    actions.push({
      icon: 'WeChatOutlined',
      description: '微信分享',
    });
  }
  const onSelect = (e, item) => {
    if (item.description === '生成海报') {
      createCard();
      return;
    }
    if (item.description === '复制链接') {
      handleH5Share();
      return;
    }
    if (item.description === '微信分享') {
      handleWxShare();
      return;
    }
  };
  return (
        <ActionSheet
            visible={show}
            onClose={onClose}
            layout='row'
            actions={actions}
            buttonStyle={{ fontSize: 14 }}
            onSelect={onSelect}
        >
        </ActionSheet>
  );
};

export default React.memo(index);
