import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { Video, Icon } from '@discuzq/design';
import { noop } from '../utils';
import calcVideoSize from '@common/utils/calc-video-size';

/**
 * 视频
 * @prop {boolean} isPay 是否需要付费
 * @prop {string | number} width 视频宽度
 * @prop {string | number} height 视频高度
 * @prop {string | number} money 付费金额
 * @prop {string} coverUrl 封面图片
 * @prop {string} url 视频地址
 * @prop {string} time 总时长
 * @prop {function} onPay 付费时，蒙层点击事件
 */

//TODO 视频转码中和错误状态的蒙层样式有问题，需要调整
const Index = ({
  isPay = false,
  coverUrl,
  url,
  time,
  money = 0,
  status = 0,
  onPay = noop,
  baselayout = {},
  v_width = null,
  v_height = null,
  onVideoReady = noop,
}) => {
  let player = null;
  const ref = useRef();
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);

  const onReady = (ins) => {
    player = ins;
  };

  const onPlay = (e) => {
    if(player && e && baselayout) {
      // 暂停之前正在播放的音视频
      if(baselayout.playingVideoDom) {
        // 暂停之前正在播放的视频
        baselayout.pauseWebPlayingVideo(e.target);
      }
  
      if(baselayout.playingAudioDom) {
        // 暂停之前正在播放的音频
        baselayout.pauseWebPlayingAudio();
      }

      baselayout.playingVideoDom = e.target;
      baselayout.playingVideoPos = e.target?.parentNode?.parentNode?.parentNode?.offsetTop || -1;
    }
  }


  useEffect(() => {
    const rect = ref.current.getBoundingClientRect();
    const { width, height } = calcVideoSize({
      parentWidth: rect?.width || 343,
      v_width,
      v_height,
      viewHeight: window.innerHeight
    });

    // height容错
    const newHeight = (height === 'NaN' || !height) ? 0 : height
    
    setWidth(width);
    setHeight(newHeight);
  }, []);

  useEffect(() => {
    if (ref?.current?.clientHeight) {
      onVideoReady && onVideoReady();
    }
  }, [ref?.current?.clientHeight]);

  return (
    <div id="common-video-play" className={styles.container} style={{width: `${width}px`, height: `${height}px`}} ref={ref}>
      {
        width && (
          <Video
            className={styles.videoBox}
            onReady={onReady}
            onPlay={onPlay}
            src={url}
            width={width}
            height={height}
            poster={coverUrl}
            duration={time}
            playsinline={true}
          />
        )
      }
      {/* 视频蒙层 已付费时隐藏 未付费时显示 */}
      {
        isPay && <div className={styles.payBox} onClick={onPay}></div>
      }
      {
        !isPay && status !== 1 && (
          <div className={styles.payBox}>
            <div className={`${styles.alert} ${status === 0 ? styles.alertWarn : styles.alertError}`}>
              <Icon className={styles.tipsIcon} size={20} name={status === 0 ? 'TipsOutlined' : 'WrongOutlined'}></Icon>
              <span className={styles.tipsText}>{status === 0 ? '视频正在转码中，转码成功后才能正常显示！' : '错误'}</span>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default inject('baselayout')(observer(Index));
