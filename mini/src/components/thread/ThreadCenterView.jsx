import React, { useMemo, useRef, useEffect, useState } from 'react';
import Button from '@discuzq/design/dist/components/button/index';
import Icon from '@discuzq/design/dist/components/icon/index';
import AudioPlay from './audio-play';
import PostContent from './post-content';
import ProductItem from './product-item';
import VideoPlay from './video-play';
import { handleAttachmentData } from './utils';
import AttachmentView from './attachment-view';
import ImageDisplay from './image-display';
import Packet from './packet';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import { getElementRect, randomStr, noop } from './utils'

/**
 * 帖子内容组件
 * @prop {object} data 帖子数据
 * @prop {function} onClick 点赞文字内容触发
 * @prop {function} onPay 点击付费按钮触发
 */

const Index = (props) => {
  const { title = '', payType, price, paid, attachmentPrice } = props.data || {};
  const needPay = useMemo(() => payType !== 0 && !paid, [paid, payType]);
  const { 
    onClick, 
    onPay, 
    relativeToViewport = true, 
    changeHeight = noop, 
    useShowMore = true, 
    setUseShowMore = noop,
    updateViewCount
  } = props;

  const wrapperId= useRef(`thread-wrapper-${randomStr()}`)

  // 标题显示37个字符
  const newTitle = useMemo(() => {
    if (title.length > 100) {
      return `${title.slice(0, 100)}...`;
    }
    return title;
  }, [title]);

  // 帖子属性内容
  const renderThreadContent = ({ content: data } = {}, videoH = 0) => {
    const {
      text,
      imageData,
      audioData,
      videoData,
      goodsData,
      redPacketData,
      rewardData,
      fileData,
      threadId,
    } = handleAttachmentData(data);
    return (
      <>
        {text && (
          <PostContent 
            content={text} 
            updateViewCount={updateViewCount}
            onRedirectToDetail={onClick} 
            relativeToViewport={relativeToViewport}
            changeHeight={changeHeight}
            useShowMore={useShowMore}
            setUseShowMore={setUseShowMore}
          />
        )}
        {videoData && (
          <WrapperView onClick={onClick} videoH={videoH}>
            <VideoPlay
              url={videoData.mediaUrl}
              coverUrl={videoData.coverUrl}
              v_width={videoData.width || null}
              v_height={videoData.height || null}
              onPay={onPay}
              isPay={needPay}
              status={videoData.status}
              relativeToViewport={relativeToViewport}
              changeHeight={changeHeight}
              updateViewCount={updateViewCount}
            />
          </WrapperView>
        )}
        {imageData?.length ? (
            <ImageDisplay 
              platform="h5" 
              imgData={imageData} 
              isPay={needPay} 
              onPay={onPay} 
              onClickMore={onClick}
              relativeToViewport={relativeToViewport}
              updateViewCount={updateViewCount}
            />
        ) : null}
        {rewardData && <Packet type={1} money={rewardData.money} onClick={onClick}/>}
        {redPacketData && (
          <Packet money={redPacketData.money || 0} onClick={onClick} condition={redPacketData.condition}/>
        )}
        {goodsData && (
            <ProductItem
              image={goodsData.imagePath}
              amount={goodsData.price}
              title={goodsData.title}
              onClick={onClick}
            />
        )}
        {audioData && <AudioPlay url={audioData.mediaUrl} isPay={needPay} onPay={onPay} updateViewCount={updateViewCount}/>}
        {fileData?.length ? <AttachmentView threadId={threadId} attachments={fileData} onPay={onPay} isPay={needPay} updateViewCount={updateViewCount}/> : null}
      </>
    );
  };
  return (
    <>
      <View id={wrapperId.current} className={styles.wrapper}>
        {title && (
          <View className={styles.title} onClick={onClick}>
            {newTitle}
          </View>
        )}

        {renderThreadContent(props.data, props.videoH)}
      </View>

      {needPay && (
        <View className={styles.pay}>
          <Button className={styles.button} type="primary" onClick={onPay}>
            <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
            {payType === 1 ? (
              <Text className={styles.payText}>{`支付${price}元查看剩余内容`}</Text>
            ) : (
              <Text className={styles.payText}>{`支付${attachmentPrice}元查看附件内容`}</Text>
            )}
          </Button>
        </View>
      )}
    </>
  );
};

export default React.memo(Index);

// 处理
const WrapperView = ({ children, onClick, videoH = 0 }) => {
  const [styleH, setStyleH] = useState({})
  useEffect(() => {
    if (videoH > 0) {
      setStyleH({ minHeight: `${videoH}px` })
    } else {
      setStyleH({})
    }
  }, [videoH])

  return (
    <View className={styles.wrapperView} style={styleH}>
      {children}
      <View className={styles.placeholder} onClick={onClick}></View>
    </View>
  )
}