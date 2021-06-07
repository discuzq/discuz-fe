import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import Video from '@discuzq/design/dist/components/video/index';
import Icon from '@discuzq/design/dist/components/icon/index';
import { noop } from '../utils';
import { View, Text } from '@tarojs/components'
import { getElementRect, randomStr } from '../utils'
import Taro from '@tarojs/taro';


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
}) => {
  let player = null;
  const videoId = useRef(`video${randomStr()}`);
  const [width, setWidth] = useState(378);

  const onReady = (ins) => {
    player = ins;
  };

  const onPlay = (e) => {
    if(baselayout) {

      // 暂停之前正在播放的视频
      if(baselayout.playingVideoDom) {
        if(baselayout.playingVideoDom !== e.target.id) {
          Taro.createVideoContext(baselayout.playingVideoDom)?.pause();
        }
      }

       // 暂停之前正在播放的音频
      if (baselayout.playingAudioDom) {
        baselayout.playingAudioDom.pause();
      }

      if (baselayout.playingAudioDom) {
        if(baselayout.playingAudioDom !== e.target.id) {
          baselayout.playingAudioDom.pause();
        }
      }

      baselayout.playingVideoDom = e.target.id;

    }
  }

  const onFullscreenChange = (e) => { // 该函数在进出全屏的时候各被调用一次
    e && e.stopPropagation();
    if(baselayout.videoFullScreenStatus === "") { // 第一次调用
      baselayout.videoFullScreenStatus = "inFullScreen";
    } else if(baselayout.videoFullScreenStatus === "inFullScreen") { //第二次调用
      baselayout.videoFullScreenStatus = "offFullScreen";
    }
  }

  useEffect(() => {
    getElementRect(videoId.current).then(res => {
      setWidth(res?.width || 378);
    })
  }, []);

  return (
    <View id={videoId.current} className={styles.container} style={{height: `${9 * (width) / 16 || '224'}px`}}>
      {
        width && (
          <Video
            className={styles.videoBox}
            onReady={onReady}
            onPlay={onPlay}
            onFullscreenChange={onFullscreenChange}
            src={url}
            width={width}
            height={9 * (width) / 16 || '224'}
            poster={coverUrl}
            duration={time}
          />
        )
      }
      {/* 视频蒙层 已付费时隐藏 未付费时显示 */}
      {
        isPay && <View className={styles.payBox} onClick={onPay}></View>
      }
      {
        !isPay && status !== 1 && (
          <View className={styles.payBox}>
            <View className={`${styles.alert} ${status === 0 ? styles.alertWarn : styles.alertError}`}>
              <Icon className={styles.tipsIcon} size={20} name={status === 0 ? 'TipsOutlined' : 'WrongOutlined'}></Icon>
              <Text className={styles.tipsText}>{status === 0 ? '视频正在转码中，转码成功后才能正常显示！' : '错误'}</Text>
            </View>
          </View>
        )
      }
    </View>
  );
};

export default inject('baselayout')(observer(Index));
