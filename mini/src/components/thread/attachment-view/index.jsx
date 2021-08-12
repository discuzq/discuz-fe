import React, { useState, useRef, useEffect }from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import Toast from '@discuzq/design/dist/components/toast/index';
import Spin from '@discuzq/design/dist/components/spin/index';
import Icon from '@discuzq/design/dist/components/icon/index';
import AudioPlayer from '@discuzq/design/dist/components/audio-player/index';
import { AUDIO_FORMAT } from '@common/constants/thread-post';
import { extensionList, isPromise, noop } from '../utils';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import getAttachmentIconLink from '@common/utils/get-attachment-icon-link';
import { throttle } from '@common/utils/throttle-debounce.js';
import { ATTACHMENT_FOLD_COUNT } from '@common/constants';
import Router from '@discuzq/sdk/dist/router';

/**
 * 附件
 * @prop {Array} attachments 附件数组
 * @prop {Boolean} isHidden 是否隐藏删除按钮
 */

const Index = ({
  attachments = [],
  isHidden = true,
  isPay = false,
  onClick = noop,
  onPay = noop,
  user = null,
  threadId = null,
  thread = null,
  baselayout,
  updateViewCount = noop,
}) => {
  // 处理文件大小的显示
  const handleFileSize = (fileSize) => {
    if (fileSize > 1000000) {
      return `${(fileSize / 1000000).toFixed(2)} M`;
    }
    if (fileSize > 1000) {
      return `${(fileSize / 1000).toFixed(2)} KB`;
    }

    return `${fileSize} B`;
  };

  const fetchDownloadUrl = async (threadId, attachmentId, callback) => {
    if(!threadId || !attachmentId) return;

    // TODO: toastInstance 返回的是boolean
    // let toastInstance = Toast.loading({
    //   duration: 0,
    // });

    await thread.fetchThreadAttachmentUrl(threadId, attachmentId).then((res) => {
      if(res?.code === 0 && res?.data) {
        const { url } = res.data;
        if(!url) {
          Toast.info({ content: '获取下载链接失败' });
        }

        callback(url);
      } else {
        Toast.info({ content: res?.msg });
      }
    }).catch((error) => {
      Toast.info({ content: '获取下载链接失败' });
      console.error(error);
      return;
    }).finally(() => {
      // toastInstance?.destroy();
    });
  }

  const [downloading, setDownloading] =
        useState(Array.from({length: attachments.length}, () => false));

  const onDownLoad = (item, index) => {
    updateViewCount();
    if (!isPay) {

      // 下载中
      if(downloading?.length && downloading[index]) {
        Toast.info({content: "下载中，请稍后"});
        return;
      }

      if(!item || !threadId) return;

      // downloading[index] = true;
      // setDownloading([...downloading]);

      if(!item?.url) {
        Toast.info({content: "获取下载链接失败"});
        // downloading[index] = false;
        // setDownloading([...downloading]);
        return;
      }

      Taro.downloadFile({
        url: item.url,
        success: function (res) {
          Taro.openDocument({
            filePath: res.tempFilePath,
            success: function (res) {
              Toast.info({content: "下载成功"});
            },
            fail: function (error) {
              Toast.info({ content: "小程序暂不支持下载此类文件，请点击“链接”复制下载链接" });
              console.error(error.errMsg)
            },
            complete: function () {
            }
          })
        },
        fail: function (error) {
          if(error?.errMsg.indexOf("domain list") !== -1) {
            Toast.info({ content: "下载链接不在域名列表中" });
          } else if(error?.errMsg.indexOf("invalid url") !== -1) {
            Toast.info({ content: "下载链接无效" });
          } else {
            Toast.info({ content: error.errMsg });
          }
          console.error(error.errMsg)
        },
        complete: function () {
          // downloading[index] = false;
          // setDownloading([...downloading]);
        }
      })

    } else {
      onPay();
    }
  };

  const onLinkShare = (item, index) => {
    updateViewCount();
    if (!isPay) {
      if(!item || !threadId) return;

      const attachmentId = item.id;
      fetchDownloadUrl(threadId, attachmentId, (url) => {
        Taro.setClipboardData({
          data: url,
          success: function (res) {
            Taro.getClipboardData({
              success: function (res) {
              }
            })
          }
        })
      });

    } else {
      onPay();
    }
  };

    // 音频播放
  const isAttachPlayable = (file) => {
    return AUDIO_FORMAT.includes(file?.extension?.toUpperCase())
  };

  const beforeAttachPlay = async (file) => {
    // 该文件已经通过校验，能直接播放
    if (file.readyToPlay) {
      return true;  
    }

    if (!isPay) {
      if(!file || !threadId) return;

      await fetchDownloadUrl(threadId, file.id, () => {
        file.readyToPlay = true;
      });
    } else {
      onPay();
    }

    return !!file.readyToPlay;
  };

  const onPlay = (audioRef, audioWrapperRef) => {
    const audioContext = audioRef?.current?.getState()?.audioCtx;
    updateViewCount();
    if( audioContext && baselayout && audioWrapperRef) {
      
      // 暂停之前正在播放的视频
      if(baselayout.playingVideoDom) {
        Taro.createVideoContext(baselayout.playingVideoDom)?.pause();
      }

       // 暂停之前正在播放的音频
      if (baselayout.playingAudioDom) {
        if(baselayout.playingAudioWrapperId !== audioWrapperRef.current.uid) {
          baselayout.playingAudioDom?.pause();
          baselayout.playingAudioWrapperId = audioWrapperRef.current.uid;
        }
      }

      baselayout.playingAudioDom = audioContext;
      baselayout.playingAudioWrapperId = audioWrapperRef.current.uid;
    }
  };

  const Normal = ({ item, index, type }) => {
    if (isAttachPlayable(item)) {
      const { url, fileName, fileSize } = item;
      const audioRef = useRef();
      const audioWrapperRef = useRef();

      return (
        <View className={styles.audioContainer} key={index} onClick={onClick} ref={audioWrapperRef}>
          <AudioPlayer
            ref={audioRef}
            src={url}
            fileName={fileName}
            onPlay={() => onPlay(audioRef, audioWrapperRef)}
            fileSize={handleFileSize(parseFloat(item.fileSize || 0))}
            beforePlay={async () => await beforeAttachPlay(item)}
            onDownload={throttle(() => onDownLoad(item, index), 1000)}
            onLink={throttle(() => onLinkShare(item), 1000)}
          />
        </View>
      );
    }

    return (
      <View className={styles.container} key={index} onClick={onClick} >
        <View className={styles.wrapper}>
          <View className={styles.left}>
          <Image src={getAttachmentIconLink(type)} className={styles.containerIcon} mode="widthfix"/>
            <View className={styles.containerText}>
              <Text className={styles.content}>{item.fileName}</Text>
              <Text className={styles.size}>{handleFileSize(parseFloat(item.fileSize || 0))}</Text>
            </View>
          </View>

          <View className={styles.right}>
            <Text onClick={throttle(() => onLinkShare(item), 1000)}>链接</Text>
            <View className={styles.label}>
              { downloading[index] ?
                <Spin className={styles.spinner} type="spinner" /> :
                <Text onClick={throttle(() => onDownLoad(item, index), 1000)}>下载</Text>
              }
            </View>
          </View>
        </View>
      </View>
    );
  };

  const Pay = ({ item, index, type }) => {
    return (
      <View className={`${styles.container} ${styles.containerPay}`} key={index} onClick={onPay}>
        <Image src={getAttachmentIconLink(type)} className={styles.containerIcon} mode="widthfix"/>
        <Text className={styles.content}>{item.fileName}</Text>
      </View>
    );
  };

  // 是否展示 查看更多
  const [isShowMore, setIsShowMore] = useState(false);
  useEffect(() => {
    // 详情页不折叠
    const {path} = Taro.getCurrentInstance().router;
    if (~path.indexOf('/indexPages/thread/index')) {
      setIsShowMore(false);
    } else {
      setIsShowMore(attachments.length > ATTACHMENT_FOLD_COUNT);
    }
  }, []);
  const clickMore = () => {
    setIsShowMore(false);
  };

  return (
    <View className={styles.wrapper}>
        {
          attachments.map((item, index) => {
            if (isShowMore && index >= ATTACHMENT_FOLD_COUNT) {
              return null;
            }

            // 获取文件类型
            const extension = item?.extension || '';
            const type = extensionList.indexOf(extension.toUpperCase()) > 0
              ? extension.toUpperCase()
              : 'UNKNOWN';

            return (
              !isPay ? (
                <Normal key={index} item={item} index={index} type={type} />
              ) : (
                <Pay key={index} item={item} index={index} type={type} />
              )
            );
          })
        }
        {
          isShowMore ? (<View className={styles.loadMore} onClick={clickMore}>
            查看更多<Icon name='RightOutlined' className={styles.icon} size={12} />
          </View>) : <></>
        }
    </View>
  );
};

export default inject('user', 'baselayout', 'thread')(observer(Index));
