import React, { useState, useRef, useEffect }from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, Toast, Spin, AudioPlayer } from '@discuzq/design';
import { extensionList, isPromise, noop } from '../utils';
import { throttle } from '@common/utils/throttle-debounce.js';
import h5Share from '@discuzq/sdk/dist/common_modules/share/h5';
import isWeiXin from '@common/utils/is-weixin';
import { FILE_PREVIEW_FORMAT, AUDIO_FORMAT } from '@common/constants/thread-post';
import FilePreview from './../file-preview';
import getAttachmentIconLink from '@common/utils/get-attachment-icon-link';
import { ATTACHMENT_FOLD_COUNT } from '@common/constants';
import { get } from '@common/utils/get';
import { readDownloadAttachmentStatus } from '@server';
import { downloadAttachment } from '@common/utils/download-attachment-web';
import goToLoginPage from '@common/utils/go-to-login-page';

import styles from './index.module.scss';
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
  threadId = null,
  thread = null,
  user = null,
  site = null,
  updateViewCount = noop,
  unifyOnClick = null,
  canDownloadAttachment = false,
  canViewAttachment = false,
}) => {
  let itemUrl = null;
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

    let toastInstance = Toast.loading({
      duration: 0,
    });

    await thread.fetchThreadAttachmentUrl(threadId, attachmentId).then((res) => {
      if(res?.code === 0 && res?.data) {
        const { url, fileName } = res.data;
        if(!url) {
          Toast.info({ content: '获取下载链接失败' });
        }
        callback(url, fileName);
      } else {
        if(res?.msg || res?.Message) Toast.info({ content: res?.msg || res?.Message });
      }
    }).catch((error) => {
      Toast.info({ content: '获取下载链接失败' });
      console.error(error);
      return;
    }).finally(() => {
      toastInstance?.destroy();
    });
  }

  const [downloading, setDownloading] =
        useState(Array.from({length: attachments.length}, () => false));

  const onDownLoad = (item, index) => {
    updateViewCount();

    // 下载需要登录态，判断是否登录
    if (!user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (!canDownloadAttachment) {
      Toast.warning({ content: '暂⽆权限下载附件' });
      return;
    }

    itemUrl = item.url; // 暂用于微信下载

    if (!isPay) {
      if(!item || !threadId) return;

      // downloading[index] = true;
      // setDownloading([...downloading]);


      // if(isWeiXin()) {
      //   window.location.href = item.url;
        
      //   Toast.info({ content: '下载成功' });
      // } else {
        const attachmentId = item.id;
        fetchDownloadUrl(threadId, attachmentId, (url, fileName) => {
          // window.location.href = url;
          download(url, fileName);
        });
      // }

      // downloading[index] = false;
      // setDownloading([...downloading]);

    } else {
      onPay();
    }
  };

  const download = async (url, fileName) => {
    const params = downloadAttachmentParams(url);
    if (params) {
      const isDownload = await downloadAttachmentStatus(params);
      if (isDownload) {
        window.location.href = itemUrl;
        downloadAttachment(url, null, false); // 携带登录态请求一下数据，后端记录下载次数
        Toast.info({ content: '下载成功' });
      }
    }
  }

  const downloadAttachmentParams = (url) => {
    if (!url) return;
    const paramArr = url.split('?')[1].split('&');
    const params = {
      sign: paramArr[0].split('=')[1],
      attachmentsId: Number(paramArr[1].split('=')[1]),
      isCode: 1,
    }
    return params;
  }

  const downloadAttachmentStatus = async (params) => {
    const res = await readDownloadAttachmentStatus(params);

    if (res?.code === 0) {
      // 弹出下载弹框
      return true;
    }

    if (res?.code === -7083) {  // 超过今天可下载附件的最大次数
      Toast.info({ content: res?.msg });
    }

    if (res?.code === -7082) {  // 下载资源已失效
      Toast.info({ content: res?.msg });
    }

    if (res?.code === -4004) {  // 资源不存在
      Toast.info({ content: res?.msg });
    }
    return false;
  }

  const onLinkShare = (item, e) => {
    updateViewCount();
    if (!canViewAttachment) {
      Toast.warning({ content: '暂⽆权限查看附件' });
      return;
    }
    if (!isPay) {
      if(!item || !threadId) return;

      const attachmentId = item.id;
      fetchDownloadUrl(threadId, attachmentId, async (url, fileName) => {
        // 链接拼接
        url = splicingLink(url, fileName);
        
        setTimeout(() => {
          if(!h5Share({url: url})) {
            navigator.clipboard.writeText(url); // qq浏览器不支持异步document.execCommand('Copy')
          }
          Toast.success({
            content: '链接复制成功',
          });
        }, 300);
      });

    } else {
      onPay();
    }
  };

  const splicingLink = (url, fileName) => {
    const host = window.location.host; // 域名
    const protocol = window.location.protocol; // 协议
    return `${protocol}//${host}/download?url=${url}&fileName=${fileName}&threadId=${threadId}`;
  }

  // 文件是否可预览
  const isAttachPreviewable = (file) => {
    const qcloudCosDocPreview = get(site, 'webConfig.qcloud.qcloudCosDocPreview', false);
    return qcloudCosDocPreview && FILE_PREVIEW_FORMAT.includes(file?.extension?.toUpperCase())
  };

  // 附件预览
  const [previewFile, setPreviewFile] = useState(null);
  const onAttachPreview = (file) => {
    updateViewCount();
    if (!canViewAttachment) {
      Toast.warning({ content: '暂⽆权限查看附件' });
      return;
    }

    if (!isPay) {
      if(!file || !threadId) return;

      fetchDownloadUrl(threadId, file.id, () => { // 校验权限
        setPreviewFile(file);
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

    // 播放前校验权限
    updateViewCount();
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

  const Normal = ({ item, index, type }) => {
    if (isAttachPlayable(item)) {
      const { url, fileName, fileSize } = item;

      return (
        <div className={styles.audioContainer} key={index} onClick={onClick} >
          <AudioPlayer
            src={url}
            fileName={fileName}
            fileSize={handleFileSize(parseFloat(item.fileSize || 0))}
            beforePlay={unifyOnClick || (async () => await beforeAttachPlay(item))}
            onDownload={unifyOnClick || (throttle(() => onDownLoad(item, index), 1000))}
            onLink={unifyOnClick || (throttle(() => onLinkShare(item), 1000))}
          />
        </div>
      );
    }

    return (
      <div className={styles.container} key={index} onClick={onClick} >
        <div className={styles.wrapper}>
          <div className={styles.left}>
            <img className={styles.containerIcon} src={getAttachmentIconLink(type)}/>
            <div className={styles.containerText}>
              <span className={styles.content}>{item.fileName}</span>
              <span className={styles.size}>{handleFileSize(parseFloat(item.fileSize || 0))}</span>
            </div>
          </div>

          <div className={styles.right}>
            {
              isAttachPreviewable(item)
                ? <span onClick={unifyOnClick || (throttle(() => onAttachPreview(item), 1000))}>预览</span>
                : <></>
            }
            <span className={styles.span} onClick={unifyOnClick || (throttle(() => onLinkShare(item), 1000))}>链接</span>
            <div className={styles.label}>
              { downloading[index] ?
                  <Spin className={styles.spinner} type="spinner" /> :
                  <span
                    className={styles.span}
                    onClick={unifyOnClick || (throttle(() => onDownLoad(item, index), 1000))}
                  >
                    下载
                  </span>
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Pay = ({ item, index, type }) => {
    return (
      <div className={`${styles.container} ${styles.containerPay}`} key={index} onClick={onPay}>
        <img className={styles.containerIcon} src={getAttachmentIconLink(type)}/>
        <span className={styles.content}>{item.fileName}</span>
      </div>
    );
  };

  // 是否展示 查看更多
  const [isShowMore, setIsShowMore] = useState(false);
  useEffect(() => {
    // 详情页不折叠
    const {pathname} = window.location;
    if (/^\/thread\/\d+/.test(pathname)) {
      setIsShowMore(false);
    } else {
      setIsShowMore(attachments.length > ATTACHMENT_FOLD_COUNT);
    }
  }, []);
  const clickMore = () => {
    setIsShowMore(false);
  };

  return (
    <div className={styles.wrapper}>
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
          isShowMore ? (<div className={styles.loadMore} onClick={clickMore}>
            查看更多<Icon name='RightOutlined' className={styles.icon} size={12} />
          </div>) : <></>
        }
        { previewFile ? <FilePreview file={previewFile} onClose={() => setPreviewFile(null) } /> : <></> }
    </div>
  );
};

export default inject('thread', 'user', 'site')(observer(Index));
