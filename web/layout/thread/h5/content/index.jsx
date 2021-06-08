import React from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, Button } from '@discuzq/design';
import { parseContentData } from '../../utils';
import ImageDisplay from '@components/thread/image-display';
import AudioPlay from '@components/thread/audio-play';
import PostContent from '@components/thread/post-content';
import ProductItem from '@components/thread/product-item';
import VideoPlay from '@components/thread/video-play';
import PostRewardProgressBar, { POST_TYPE } from '@components/thread/post-reward-progress-bar';
import Tip from '@components/thread/tip';
import AttachmentView from '@components/thread/attachment-view';
import { minus } from '@common/utils/calculate';
import classnames from 'classnames';
import UserInfo from '@components/thread/user-info';
import styles from './index.module.scss';
import { debounce } from '@common/utils/throttle-debounce';

// 帖子内容
const RenderThreadContent = inject('user')(
  observer((props) => {
    const { store: threadStore } = props;
    const { text, indexes } = threadStore?.threadData?.content || {};
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

    // 是否附件付费帖
    const isAttachmentPay = threadStore?.threadData?.payType === 2 && threadStore?.threadData?.paid === false;
    const attachmentPrice = threadStore?.threadData?.attachmentPrice || 0;
    // 是否付费帖子
    const isThreadPay = threadStore?.threadData?.payType === 1;
    const threadPrice = threadStore?.threadData?.price || 0;
    // 是否已经付费
    const isPayed = threadStore?.threadData?.paid === true;
    // 当前用户是否需要付费
    const isNeedPay = threadStore?.threadData?.payType === 1 && threadStore?.threadData?.paid === false;
    // 是否作者自己
    const isSelf = props.user?.userInfo?.id && props.user?.userInfo?.id === threadStore?.threadData?.userId;

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

    // 是否可以免费查看付费帖子
    const canFreeViewPost = threadStore?.threadData?.ability.canFreeViewPost;

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
      url && window.open(url);
    };

    const onRewardClick = () => {
      typeof props.onRewardClick === 'function' && props.onRewardClick();
    };

    const onClickUser = (e) => {
      typeof props.onClickUser === 'function' && props.onClickUser(e);
    };

    return (
      <div className={`${styles.container}`}>
        <div className={styles.header}>
          <div className={styles.userInfo}>
            <UserInfo
              name={threadStore?.threadData?.user?.nickname || ''}
              avatar={threadStore?.threadData?.user?.avatar || ''}
              location={threadStore?.threadData?.position.location || ''}
              groupName={threadStore?.threadData?.group?.groupName || ''}
              view={`${threadStore?.threadData?.viewCount}` || ''}
              time={`${threadStore?.threadData?.createdAt}` || ''}
              isEssence={isEssence}
              isPay={!isFree}
              isReward={isReward}
              isRed={isRedPack}
              onClick={onClickUser}
            ></UserInfo>
          </div>
          {props?.user?.isLogin() && isApproved && (
            <div className={styles.more} onClick={onMoreClick}>
              <Icon size={20} color="#8590A6" name="MoreVOutlined"></Icon>
            </div>
          )}
        </div>

        <div className={styles.body}>
          {/* 标题 */}
          {threadStore?.threadData?.title && <div className={styles.title}>{threadStore?.threadData?.title}</div>}

          {/* 文字 */}
          {text && <PostContent useShowMore={false} content={text || ''} />}

          {/* 悬赏文案 */}
          {parseContent.REWARD && (
            <div className={styles.rewardText}>
              {/* 悬赏 */}
              {parseContent.REWARD && (
                <div>
                  <div className={styles.rewardMoney}>
                    本帖向所有人悬赏
                    <span className={styles.rewardNumber}>{parseContent.REWARD.money || 0}</span>元
                  </div>
                  <div className={styles.rewardTime}>{parseContent.REWARD.expiredAt}截止悬赏</div>
                </div>
              )}
            </div>
          )}

          {/* 付费附件 */}
          {!canFreeViewPost && isAttachmentPay && !isSelf && !isPayed && (
            <div style={{ textAlign: 'center' }} onClick={onContentClick}>
              <Button className={styles.payButton} type="primary">
                <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
                <p>支付{attachmentPrice}元查看附件内容</p>
              </Button>
            </div>
          )}

          {/* 图片 */}
          {parseContent.IMAGE && <ImageDisplay imgData={parseContent.IMAGE} />}

          {/* 视频 */}
          {parseContent.VIDEO && (
            <VideoPlay
              url={parseContent.VIDEO.mediaUrl}
              coverUrl={parseContent.VIDEO.coverUrl}
              width={400}
              height={200}
              status={parseContent.VIDEO.status}
            />
          )}
          {/* 音频 */}
          {parseContent.VOICE && <AudioPlay url={parseContent.VOICE.mediaUrl} />}
          {/* 附件 */}
          {parseContent.VOTE && <AttachmentView attachments={parseContent.VOTE} />}
          {/* 商品 */}
          {parseContent.GOODS && (
            <div>
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
                <span className={styles.buyText}>购买商品</span>
              </Button>
            </div>
          )}
          {/* 标签 */}
          {threadStore?.threadData?.categoryName && (
            <div className={styles.tag} onClick={onTagClick}>
              {threadStore?.threadData?.categoryName}
            </div>
          )}

          {(parseContent.RED_PACKET || parseContent.REWARD) && (
            <div className={styles.reward}>
              {/* 悬赏 */}
              {parseContent.REWARD && (
                <div className={styles.rewardBody}>
                  <PostRewardProgressBar
                    type={POST_TYPE.BOUNTY}
                    remaining={Number(parseContent.REWARD.remainMoney || 0)}
                    received={minus(
                      Number(parseContent.REWARD.money || 0),
                      Number(parseContent.REWARD.remainMoney || 0),
                    )}
                  />
                </div>
              )}
              {/* 红包 */}
              {parseContent.RED_PACKET && (
                <PostRewardProgressBar
                  remaining={Number(parseContent.RED_PACKET.remainNumber || 0)}
                  received={
                    Number(parseContent.RED_PACKET.number || 0) - Number(parseContent.RED_PACKET.remainNumber || 0)
                  }
                  condition={parseContent.RED_PACKET.condition}
                />
              )}
            </div>
          )}

          {/* 帖子付费 */}
          {!canFreeViewPost && isThreadPay && !isSelf && !isPayed && (
            <div style={{ textAlign: 'center' }} onClick={onContentClick}>
              <Button className={styles.payButton} type="primary">
                <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
                支付{threadPrice}元查看剩余内容
              </Button>
            </div>
          )}

          {/* 打赏 */}
          {canBeReward && isApproved && !isSelf && (
            <div className={styles.rewardContianer}>
              <Button onClick={onRewardClick} className={styles.rewardButton} type="primary">
                <Icon className={styles.payIcon} name="HeartOutlined" size={20}></Icon>
                <span className={styles.rewardext}>打赏</span>
              </Button>
            </div>
          )}
        </div>

        {isApproved && (
          <div className={styles.footer}>
            <div className={styles.thumbs}>
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
                  className={classnames(styles.payIcon, isRewarded && styles.actived)}
                  name="HeartOutlined"
                  size={20}
                ></Icon>
              )}
              {/* 点赞 */}
              <div
                className={classnames(styles.liked, threadStore?.threadData?.isLike && styles.actived)}
                onClick={debounce(onLikeClick, 500)}
              >
                <Icon name="LikeOutlined" size={20}></Icon>
                {threadStore?.threadData?.likeReward?.likePayCount > 0 && (
                  <span className={styles.likedNumber}>{threadStore?.threadData?.likeReward?.likePayCount || ''}</span>
                )}
              </div>
              <div className={styles.likeReward}>
                <Tip tipData={tipData} imgs={threadStore?.threadData?.likeReward?.users || []} showMore={true}></Tip>
              </div>
            </div>
            {threadStore?.threadData?.likeReward?.shareCount > 0 && (
              <div className={styles.shareCount}>{threadStore?.threadData?.likeReward?.shareCount}次分享</div>
            )}
          </div>
        )}
      </div>
    );
  }),
);

export default RenderThreadContent;
