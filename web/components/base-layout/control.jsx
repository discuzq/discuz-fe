import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { inject, observer } from 'mobx-react';
import { noop } from '@components/thread/utils';
import { throttle } from '@common/utils/throttle-debounce.js';


import H5BaseLayout from './h5';
import PCBaseLayout from './pc';

/**
* 集成布局交互逻辑控制，用于控制音视频播放、jump等有关scroll的布局操作
* @prop {function} onScroll 触发滚动函数
* @prop {boolean} quickScroll 是否加throttle给handleScroll
* @prop {boolean} hasListChild 页面是否有List组件
* @prop {boolean} jumpTo 跳转到List组件什么位置
* @prop {string} pageName 'home'是主页, 'search'是搜索页，用于记录当前页面阅读位置
* @prop {function}
* @example
*     <BaseLayout>
        <BaseLayoutControl>
        </BaseLayoutControl>
      </BaseLayout>
*/

const BaseLayoutControl = forwardRef((props, ref) => {
  const {
    site,
    baselayout = {},
    onScroll = noop,
    quickScroll = false,
    hasListChild = true,
    jumpTo = -1,
    pageName = '',
    ready = noop,
    ...others
  } = props;

  const [listRef, setListRef] = useState(null);
  const [baseLayoutWhiteList, setBaseLayoutWhiteList] = useState(['home', 'search']);
  const layoutRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      listRef
    }),
  );

  useEffect(() => {
    ready();
  }, []);

  useEffect(() => {
    if (hasListChild) setListRef(layoutRef?.current.listRef);
  }, [layoutRef]);

  useEffect(() => {
    if (hasListChild && listRef?.current && pageName && baseLayoutWhiteList.indexOf(pageName) !== -1) {
      if (jumpTo > 0) {
        baselayout[pageName] = jumpTo;
        listRef.current.jumpToScrollTop(jumpTo);
      } else {
        if(baselayout[pageName] > 0) {
          if (pageName !== 'search' || // 首页在PC和H5都适用阅读区域跳转
              (pageName === 'search' && site.platform === 'h5')) { // 搜索页只适用H5页面阅读区域跳转
            // 需要异步触发，可能存在列表没有渲染出来
            setTimeout(() => {
              listRef.current.jumpToScrollTop(baselayout[pageName]);
            });
          }
        } else if(baselayout.isJumpingToTop) {
          baselayout.removeJumpingToTop();
          listRef.current.onBackTop();
        }
      }
    }
  }, [jumpTo, hasListChild, listRef?.current, pageName]);


  const quickScrolling = (e) => {

    if (!e || !e.scrollTop || !hasListChild || !listRef?.current?.currentScrollTop) {
      onScroll();
      return;
    }
    const { scrollTop } = e;
    if (scrollTop && pageName) baselayout[pageName] = scrollTop;

    const { playingVideoDom } = baselayout;

    if (playingVideoDom) {
      const playingVideoTop = baselayout.playingVideoPos;
      const playingVideoBottom = playingVideoDom.offsetHeight + playingVideoTop;

      if (playingVideoTop > 0
        && (playingVideoBottom < scrollTop // 视频在视窗下面
          || playingVideoTop > window.innerHeight + scrollTop)) { // 视频在视窗上面
        baselayout.pauseWebPlayingVideo();
      }
    }

    const { playingAudioDom } = baselayout;
    if (playingAudioDom) {
      const playingAudioTop = baselayout.playingAudioPos;
      const playingAudioHeight = 56;
      const playingAudioBottom = playingAudioHeight + playingAudioTop;

      if (playingAudioTop > 0
        && (playingAudioBottom < scrollTop // 音频在视窗下面
          || playingAudioTop > window.innerHeight + scrollTop)) { // 音频在视窗上面

        baselayout.pauseWebPlayingAudio();
      }
    }

    onScroll({ scrollTop });
  };

  const handleScroll = quickScroll ? quickScrolling : throttle(quickScrolling, 50);

  if (site.platform === 'pc') {
    return <PCBaseLayout onScroll={handleScroll} pageName={pageName} platform={site.platform} {...others} ref={layoutRef} />;
  }

  return <H5BaseLayout onScroll={handleScroll} pageName={pageName} platform={site.platform} {...others} ref={layoutRef} />;
});

export default inject('site', 'baselayout')(observer(BaseLayoutControl));
