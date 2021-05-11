import React, { memo } from 'react';
import { inject, observer } from 'mobx-react';
import NoticeItem from '@components/message/notice-item';
import SliderLeft from '@components/message/slider-left';

const Index = ({ site, ...props }) => {
  const { platform } = site;
  const renderPC = () => {
    const { list, ...other } = props;
    return (<>
      {list.map(item => <NoticeItem key={item.id} item={item} {...other} />)}
    </>)
  }

  if (platform === 'pc') return renderPC();
  return <SliderLeft RenderItem={NoticeItem} {...props} />
}

export default inject('site')(observer(memo(Index)));
