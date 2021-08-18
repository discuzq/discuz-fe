import React from 'react';
import { inject, observer } from 'mobx-react';
import { View, Text } from '@tarojs/components';
import Icon from '@discuzq/design/dist/components/icon/index';
import Button from '@discuzq/design/dist/components/button/index';
import Router from '@discuzq/sdk/dist/router';
import ImageDisplay from '@components/thread/image-display';
import AudioPlay from '@components/thread/audio-play';
import PostContent from '@components/thread/post-content';
import ProductItem from '@components/thread/product-item';
import VideoPlay from '@components/thread/video-play';
import VoteDisplay from '@components/thread/vote-display';
import PostRewardProgressBar, { POST_TYPE } from '@components/thread/post-reward-progress-bar';
import Tip from '@components/thread/tip';
import AttachmentView from '@components/thread/attachment-view';
import { minus } from '@common/utils/calculate';
import classnames from 'classnames';
import UserInfo from '@components/thread/user-info';
import { setClipboardData } from '@tarojs/taro';
import { parseContentData } from '../../utils';
import styles from './index.module.scss';

// 帖子内容
const RenderThreadContent = inject('user')(
  observer((props) => {
    const { store: threadStore } = props;
    const { text, indexes } = threadStore?.threadData?.content || {};
    const { parentCategoryName, categoryName } = threadStore?.threadData;
    const tipData = {
      postId: threadStore?.threadData?.postId,
      threadId: threadStore?.threadData?.threadId,
      platform: 'h5',
      payType: threadStore?.threadData?.payType,
    };
    // 是否合法
    const isApproved = (threadStore?.threadData?.isApproved || 0) === 1;
    const isEssence = threadStore?.threadData?.displayTag?.isEssence || false;

    // 是否免费帖
    const isFree = threadStore?.threadData?.payType === 0;

    // 是否可以免费查看付费帖子
    const canFreeViewPost = threadStore?.threadData?.ability.canFreeViewPost;

    // 是否已经付费
    const isPayed = threadStore?.threadData?.paid === true;

    // 是否作者自己
    const isSelf = props.user?.userInfo?.id && props.user?.userInfo?.id === threadStore?.threadData?.userId;

    // 是否附件付费帖
    const isAttachmentPay = threadStore?.threadData?.payType === 2 && threadStore?.threadData?.paid === false;
    const attachmentPrice = threadStore?.threadData?.attachmentPrice || 0;
    // 是否需要附加付费
    const needAttachmentPay = !canFreeViewPost && isAttachmentPay && !isSelf && !isPayed;
    // 是否付费帖子
    const isThreadPay = threadStore?.threadData?.payType === 1;
    const threadPrice = threadStore?.threadData?.price || 0;
    // 当前用户是否需要付费
    const isNeedPay = threadStore?.threadData?.payType === 1 && threadStore?.threadData?.paid === false;

    // 是否红包帖
    const isRedPack = threadStore?.threadData?.displayTag?.isRedPack;
    // 是否悬赏帖
    const isReward = threadStore?.threadData?.displayTag?.isReward;

    // 是否打赏帖
    const isBeReward = isFree && threadStore?.threadData?.ability.canBeReward && !isRedPack && !isReward;
    // 是否显示打赏按钮： 免费帖 && 不是自己 && 不是红包 && 不是悬赏 && 允许被打赏
    const canBeReward = isFree && threadStore?.threadData?.ability.canBeReward && !isRedPack && !isReward;
    // 是否已打赏
    const isRewarded = threadStore?.threadData?.isReward;

    const parseContent = parseContentData(indexes);

    const onContentClick = async () => {
      typeof props.onPayClick === 'function' && props.onPayClick();
    };

    const onTagClick = () => {
      typeof props.onTagClick === 'function' && props.onTagClick();
    };

    const onMoreClick = () => {
      props.fun.moreClick();
    };

    const onLikeClick = () => {
      typeof props.onLikeClick === 'function' && props.onLikeClick();
    };

    const onBuyClick = (url) => {
      setClipboardData({
        data: url,
        success: () => {
          // hideToast();
          // Toast.info({
          //   content: '商品地址已复制，请在浏览器上黏贴访问',
          // });
        },
      });
    };

    const onRewardClick = () => {
      typeof props.onRewardClick === 'function' && props.onRewardClick();
    };

    const onUserClick = () => {
      const userId = threadStore?.threadData?.user?.userId
      if(!userId) return
      Router.push({url: `/subPages/user/index?id=${userId}`});
    }

    return (
      <View className={`${styles.container}`}>
        <View className={styles.header}>
          <View className={styles.userInfo}>
            <UserInfo
              name={threadStore?.threadData?.user?.nickname || ''}
              avatar={threadStore?.threadData?.user?.avatar || ''}
              location={threadStore?.threadData?.position.location || ''}
              groupName={threadStore?.threadData?.group?.groupName || ''}
              view={`${threadStore?.threadData?.viewCount}` || ''}
              time={`${threadStore?.threadData?.diffTime}` || ''}
              isEssence={isEssence}
              isPay={!isFree}
              userId={threadStore?.threadData?.user?.userId}
              isReward={isReward}
              isRed={isRedPack}
              onClick={onUserClick}
            ></UserInfo>
          </View>
          {props?.user?.isLogin() && isApproved && (
            <View className={styles.more} onClick={onMoreClick}>
              <Icon size={20} color="#8590A6" name="MoreVOutlined"></Icon>
            </View>
          )}
        </View>

        <View className={styles.body}>
          {/* 标题 */}
          {threadStore?.threadData?.title && <View className={styles.title}>{threadStore?.threadData?.title}</View>}

          {/* 文字 */}
          {text && <PostContent useShowMore={false} content={text || ''} />}

          {/* 视频 */}
          {parseContent.VIDEO && (
            <VideoPlay
              url={parseContent.VIDEO.mediaUrl}
              coverUrl={parseContent.VIDEO.coverUrl}
              v_height={parseContent.VIDEO.height || null}
              v_width={parseContent.VIDEO.width || null}
              status={parseContent.VIDEO.status}
            />
          )}

          {/* 图片 */}
          {parseContent.IMAGE && (
            <ImageDisplay
              flat
              isPay={needAttachmentPay}
              onPay={onContentClick}
              platform="h5"
              imgData={parseContent.IMAGE}
            />
          )}

          {/* 悬赏文案 */}
          {parseContent.REWARD && (
            <View className={styles.rewardText}>
              {/* 悬赏 */}
              {parseContent.REWARD && (
                <View>
                  <View className={styles.rewardMoney}>
                    本帖向所有人悬赏
                    <Text className={styles.rewardNumber}>{parseContent.REWARD.money || 0}</Text>元
                  </View>
                  <View className={styles.rewardTime}>{parseContent.REWARD.expiredAt}截止悬赏</View>
                </View>
              )}
            </View>
          )}

          {(parseContent.RED_PACKET || parseContent.REWARD) && (
            <View className={styles.reward}>
              {/* 悬赏 */}
              {parseContent.REWARD && (
                <View className={styles.rewardBody}>
                  <PostRewardProgressBar
                    type={POST_TYPE.BOUNTY}
                    remaining={Number(parseContent.REWARD.remainMoney || 0)}
                    received={minus(
                      Number(parseContent.REWARD.money || 0),
                      Number(parseContent.REWARD.remainMoney || 0),
                    )}
                  />
                </View>
              )}
              {/* 红包 */}
              {parseContent.RED_PACKET && (
                <View>
                  <PostRewardProgressBar
                    remaining={Number(parseContent.RED_PACKET.remainNumber || 0)}
                    received={
                      Number(parseContent.RED_PACKET.number || 0) - Number(parseContent.RED_PACKET.remainNumber || 0)
                    }
                    condition={parseContent.RED_PACKET.condition}
                  />
                  {!!parseContent.RED_PACKET.condition && (
                    <View className={styles.redPacketLikeNum}>评论集{parseContent.RED_PACKET.likenum}赞领红包</View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* 商品 */}
          {parseContent.GOODS && (
            <View>
              <ProductItem
                image={parseContent.GOODS.imagePath}
                amount={parseContent.GOODS.price}
                title={parseContent.GOODS.title}
                className={styles.product}
              />
              <Button
                className={styles.buyBtn}
                type="danger"
                onClick={() => onBuyClick(parseContent.GOODS.detailContent)}
              >
                <Icon className={styles.payIcon} name="ShoppingCartOutlined" size={20}></Icon>
                <Text className={styles.buyText}>购买商品</Text>
              </Button>
            </View>
          )}

          {/* 音频 */}
          {parseContent.VOICE && <AudioPlay url={parseContent.VOICE.mediaUrl} />}

          {/* 附件 */}
          {parseContent.VOTE && (
            <AttachmentView attachments={parseContent.VOTE} threadId={threadStore?.threadData?.threadId} />
          )}

          {/* 投票 */}
          {parseContent.VOTE_THREAD
            && <VoteDisplay voteData={parseContent.VOTE_THREAD} threadId={threadStore?.threadData?.threadId} page="detail" />}
          {/* 付费附件 */}
          {needAttachmentPay && (
            <View style={{ textAlign: 'center' }} onClick={onContentClick}>
              <Button className={styles.payButton} type="primary">
                <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
                <View>支付{attachmentPrice}元查看附件内容</View>
              </Button>
            </View>
          )}

          {/* 标签 */}
          {(parentCategoryName || categoryName) && (
            <View className={styles.tag} onClick={onTagClick}>
              {parentCategoryName ? `${parentCategoryName}/${categoryName}` : categoryName}
            </View>
          )}

          {/* 帖子付费 */}
          {!canFreeViewPost && isThreadPay && !isSelf && !isPayed && (
            <View style={{ textAlign: 'center' }} onClick={onContentClick}>
              <Button className={styles.payButton} type="primary">
                <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
                支付{threadPrice}元查看剩余内容
              </Button>
            </View>
          )}

          {/* 打赏 */}
          {canBeReward && isApproved && !isSelf && (
            <View className={styles.rewardContianer}>
              <Button onClick={onRewardClick} className={styles.rewardButton} type="primary">
                <Icon className={styles.payIcon} name="HeartOutlined" size={20}></Icon>
                <Text className={styles.rewardext}>打赏</Text>
              </Button>
            </View>
          )}
        </View>

        {isApproved && (
          <View className={styles.footer}>
            <View className={styles.thumbs}>
              {/* 付费 */}
              {isThreadPay && (
                <Icon
                  className={classnames(styles.payIcon, isPayed && styles.actived)}
                  name="GoldCoinOutlined"
                  size={20}
                ></Icon>
              )}
              {/* 打赏 */}
              {isBeReward && (
                <Icon
                  onClick={() => !isSelf && onRewardClick()}
                  className={classnames(styles.payIcon, isRewarded && styles.actived)}
                  name="HeartOutlined"
                  size={20}
                ></Icon>
              )}
              {/* 点赞 */}
              <View
                className={classnames(styles.liked, threadStore?.threadData?.isLike && styles.actived)}
                onClick={onLikeClick}
              >
                <Icon name="LikeOutlined" size={20}></Icon>
                {threadStore?.threadData?.likeReward?.likePayCount > 0 && (
                  <Text className={styles.likedNumber}>{threadStore?.threadData?.likeReward?.likePayCount || ''}</Text>
                )}
              </View>
              <View className={styles.likeReward}>
                <Tip
                  tipData={tipData}
                  imgs={threadStore?.threadData?.likeReward?.users || []}
                  showMore={true}
                  showCount={5}
                ></Tip>
              </View>
            </View>
            {threadStore?.threadData?.likeReward?.shareCount > 0 && (
              <View className={styles.shareCount}>{threadStore?.threadData?.likeReward?.shareCount}次分享</View>
            )}
          </View>
        )}
      </View>
    );
  }),
);

export default RenderThreadContent;
