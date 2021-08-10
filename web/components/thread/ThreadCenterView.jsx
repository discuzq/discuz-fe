import React, { useMemo } from 'react';
import { Button, Icon } from '@discuzq/design';
import AudioPlay from './audio-play';
import PostContent from './post-content';
import ProductItem from './product-item';
import VideoPlay from './video-play';
import { handleAttachmentData } from './utils';
import AttachmentView from './attachment-view';
import ImageDisplay from './image-display';
import Packet from './packet';
import styles from './index.module.scss';

/**
 * 帖子内容组件
 * @prop {object} data 帖子数据
 * @prop {function} onClick 点赞文字内容触发
 * @prop {function} onPay 点击付费按钮触发
 */

const Index = (props) => {
    const {
        title = '',
        payType,
        price,
        paid,
        attachmentPrice,
        openedMore,
    } = props.data || {};

    const needPay = useMemo(() => {
      return payType !== 0 && !paid
    }, [paid, payType])

    const {
      onClick,
      onPay,
      onOpen,
      platform,
      updateViewCount
    } = props

    // 标题显示37个字符
    const newTitle = useMemo(() => {
      if (title.length > 100) {
        return `${title.slice(0, 100)}...`
      }
      return title
    }, [title])

    // 帖子属性内容
    const renderThreadContent = ({ content: data, attachmentPrice, payType, paid } = {}) => {
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
              {text && <PostContent
                onContentHeightChange={props.onContentHeightChange}
                content={text}
                updateViewCount={updateViewCount}
                useShowMore={!openedMore}
                onRedirectToDetail={onClick}
                onOpen={onOpen}/>
              }

              {videoData && (
                <WrapperView onClick={onClick}>
                  <VideoPlay
                    url={videoData.mediaUrl}
                    coverUrl={videoData.coverUrl}
                    v_width={videoData.width || null}
                    v_height={videoData.height || null}
                    onPay={onPay}
                    isPay={needPay}
                    status={videoData.status}
                    onVideoReady={props.onVideoReady}
                    updateViewCount={updateViewCount}
                  />
                </WrapperView>
                
              )}
              {imageData?.length > 0 && (
                  <ImageDisplay
                      platform={props.platform} 
                      imgData={imageData} 
                      isPay={needPay}
                      onPay={onPay}
                      onClickMore={onClick} 
                      onImageReady={props.onImageReady}
                      updateViewCount={updateViewCount}
                  />
                  )
              }
              {rewardData && <Packet
                type={1}
                money={rewardData.money}
                onClick={onClick}
              />}
              {redPacketData && <Packet money={redPacketData.money || 0} onClick={onClick} condition={redPacketData.condition} />}
              {goodsData && <ProductItem
                  image={goodsData.imagePath}
                  amount={goodsData.price}
                  title={goodsData.title}
                  onClick={onClick}
              />}
              {audioData && <AudioPlay url={audioData.mediaUrl} isPay={needPay} onPay={onPay} updateViewCount={updateViewCount}/>}
              {fileData?.length > 0 && <AttachmentView threadId={threadId} attachments={fileData} onPay={onPay} isPay={needPay} updateViewCount={updateViewCount}/>}
          </>
        );
    }

    return (
        <>
          <div className={`${platform === 'h5' ? styles.wrapper : styles.wrapperPC}`}>
            {title && <div className={styles.title} onClick={onClick}>{newTitle}</div>}

            {renderThreadContent(props.data)}
          </div>
            
          {
              needPay && (
                <div className={styles.pay}>
                  <Button className={styles.button} type="primary" onClick={onPay}>
                      <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
                      {payType === 1 ? <p className={styles.payText}>{`支付${price}元查看剩余内容`}</p> : <p className={styles.payText}>{`支付${attachmentPrice}元查看附件内容`}</p>}
                  </Button>                  
                </div>
                
              )
          }
        </>
    )
}

export default React.memo(Index)

// 处理
const WrapperView = ({ children, onClick }) => {
  return (
    <div className={styles.wrapperView}>
      {children}
      <div className={styles.placeholder} onClick={onClick}></div>
    </div>
  )
}
