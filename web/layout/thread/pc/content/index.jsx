import React from 'react';
import { inject, observer } from 'mobx-react';
import ImageDisplay from '@components/thread/image-display';
// import ImageDisplay from '@components/thread/image-content';
import AudioPlay from '@components/thread/audio-play';
import PostContent from '@components/thread/post-content';
import ProductItem from '@components/thread/product-item';
import VideoPlay from '@components/thread/video-play';
import VoteDisplay from '@components/thread/vote-display';
import PostRewardProgressBar, { POST_TYPE } from '@components/thread/post-reward-progress-bar';
import Tip from '@components/thread/tip';
import AttachmentView from '@components/thread/attachment-view';
import { Icon, Button, Divider, Dropdown, Toast } from '@discuzq/design';
import UserInfo from '@components/thread/user-info';
import classnames from 'classnames';
import topic from './index.module.scss';
import { minus } from '@common/utils/calculate';
import { parseContentData } from '../../utils';
import { debounce } from '@common/utils/throttle-debounce';

// 帖子内容
export default inject('user')(
  observer((props) => {
    const { store: threadStore } = props;
    const { text, indexes } = threadStore?.threadData?.content || {};
    const { parentCategoryName, categoryName } = threadStore?.threadData;
    const tipData = {
      postId: threadStore?.threadData?.postId,
      threadId: threadStore?.threadData?.threadId,
      platform: 'pc',
      payType: threadStore?.threadData?.payType,
    };
    // 是否合法
    const isApproved = (threadStore?.threadData?.isApproved || 0) === 1;

    // 是否免费帖
    const isFree = threadStore?.threadData?.payType === 0;

    // 是否加精
    const isEssence = threadStore?.threadData?.displayTag?.isEssence || false;
    // 是否置顶
    const isStick = threadStore?.threadData?.isStick;

    // 更多弹窗权限
    const canEdit = threadStore?.threadData?.ability?.canEdit;
    const canDelete = threadStore?.threadData?.ability?.canDelete;
    const canEssence = threadStore?.threadData?.ability?.canEssence;
    const canStick = threadStore?.threadData?.ability?.canStick;

    // 是否附件付费
    const isAttachmentPay = threadStore?.threadData?.payType === 2 && threadStore?.threadData?.paid === false;
    const attachmentPrice = threadStore?.threadData?.attachmentPrice || 0;
    // 是否需要附加付费
    const needAttachmentPay = !canFreeViewPost && isAttachmentPay && !isSelf && !isPayed;
    // 是否帖子付费
    const isThreadPay = threadStore?.threadData?.payType === 1;
    const threadPrice = threadStore?.threadData?.price || 0;
    // 是否已经付费
    const isPayed = threadStore?.threadData?.paid === true;
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

    const onLikeClick = () => {
      typeof props.onLikeClick === 'function' && props.onLikeClick();
    };

    const onCollectionClick = () => {
      typeof props.onCollectionClick === 'function' && props.onCollectionClick();
    };

    const onShareClick = () => {
      typeof props.onShareClick === 'function' && props.onShareClick();
    };

    const onBuyClick = (url) => {
      url && window.open(url);
    };

    const onDropdownChange = (key) => {
      typeof props.onOperClick === 'function' && props.onOperClick(key);
    };

    const onRewardClick = () => {
      typeof props.onRewardClick === 'function' && props.onRewardClick();
    };

    const onTagClick = () => {
      typeof props.onTagClick === 'function' && props.onTagClick();
    };

    const onUserClick = (e) => {
      e && e.stopPropagation();
      typeof props.onUserClick === 'function' && props.onUserClick();
    };

    return (
      <div className={`${topic.container}`}>
        <div className={topic.header}>
          <div className={topic.userInfo}>
            <UserInfo
              name={threadStore?.threadData?.user?.nickname || ''}
              avatar={threadStore?.threadData?.user?.avatar || ''}
              groupName={threadStore?.threadData?.group?.groupName || ''}
              location={threadStore?.threadData?.position.location || ''}
              view={`${threadStore?.threadData?.viewCount}` || ''}
              time={`${threadStore?.threadData?.diffTime}` || ''}
              userId={threadStore?.threadData?.user?.userId}
              isEssence={isEssence}
              isPay={!isFree}
              isReward={isReward}
              isRed={isRedPack}
              hideInfoPopip={true}
              platform="pc"
              onClick={onUserClick}
            ></UserInfo>
          </div>
          {props?.user?.isLogin() && (
            <div className={topic.more}>
              {/* 当存在任一标签时，显示分割线 */}
              {(isEssence || !isFree || isReward || isRedPack) && (
                <Divider mode="vertical" className={topic.moreDivider}></Divider>
              )}

              {isApproved && (canEdit || canStick || canEssence || canDelete) && (
                <div className={topic.iconText}>
                  <Dropdown
                    menu={
                      <Dropdown.Menu>
                        {canEdit && <Dropdown.Item id="edit">编辑</Dropdown.Item>}
                        {canStick && <Dropdown.Item id="stick">{isStick ? '取消置顶' : '置顶'}</Dropdown.Item>}
                        {canEssence && <Dropdown.Item id="essence"> {isEssence ? '取消精华' : '精华'}</Dropdown.Item>}
                        {canDelete && <Dropdown.Item id="delete">删除</Dropdown.Item>}
                      </Dropdown.Menu>
                    }
                    placement="center"
                    hideOnClick={true}
                    arrow={false}
                    trigger="hover"
                    onChange={(key) => onDropdownChange(key)}
                  >
                    <Icon className={topic.icon} name="SettingOutlined"></Icon>
                    <span className={topic.text}>管理</span>
                  </Dropdown>
                </div>
              )}
              {!props?.user?.isAdmini && (
                <div
                  className={classnames(topic.iconText, props?.user?.isAdmini && topic.disabled)}
                  onClick={() => onDropdownChange('report')}
                >
                  <Icon className={topic.icon} name="WarnOutlinedThick"></Icon>
                  <span className={topic.text}>举报</span>
                </div>
              )}
            </div>
          )}
        </div>

        <Divider className={topic.divider}></Divider>

        <div className={topic.body}>
          {/* 标题 */}
          {threadStore?.threadData?.title && <div className={topic.title}>{threadStore?.threadData?.title}</div>}

          {/* 文字 */}
          {text && <PostContent useShowMore={false} content={text || ''} usePointer={false} />}

          {/* 视频 */}
          {parseContent.VIDEO && (
            <VideoPlay
              url={parseContent.VIDEO.mediaUrl}
              coverUrl={parseContent.VIDEO.coverUrl}
              v_width={parseContent.VIDEO.width || null}
              v_height={parseContent.VIDEO.height || null}
              status={parseContent.VIDEO.status}
            />
          )}

          {/* 图片 */}
          {parseContent.IMAGE && (
            <ImageDisplay
              flat
              platform="pc"
              isPay={needAttachmentPay}
              onPay={onContentClick}
              imgData={parseContent.IMAGE}
            />
          )}

          {(parseContent.RED_PACKET || parseContent.REWARD) && (
            <div className={topic.reward}>
              {/* 悬赏 */}
              {parseContent.REWARD && (
                <div className={topic.rewardBody}>
                  <PostRewardProgressBar
                    type={POST_TYPE.BOUNTY}
                    remaining={Number(parseContent.REWARD.remainMoney || 0)}
                    received={minus(
                      Number(parseContent.REWARD.money || 0),
                      Number(parseContent.REWARD.remainMoney || 0),
                    )}
                  />
                  <div className={topic.rewardMoney}>
                    本帖向所有人悬赏
                    <span className={topic.rewardNumber}>{parseContent.REWARD.money || 0}</span>元
                  </div>
                  <div className={topic.rewardTime}>{parseContent.REWARD.expiredAt}截止悬赏</div>
                </div>
              )}

              {/* 红包 */}
              {parseContent.RED_PACKET && (
                <div>
                  <PostRewardProgressBar
                    remaining={Number(parseContent.RED_PACKET.remainNumber || 0)}
                    received={
                      Number(parseContent.RED_PACKET.number || 0) - Number(parseContent.RED_PACKET.remainNumber || 0)
                    }
                    condition={parseContent.RED_PACKET.condition}
                  />
                  {!!parseContent.RED_PACKET.condition && (
                    <div className={topic.redPacketLikeNum}>评论集{parseContent.RED_PACKET.likenum}赞领红包</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 商品 */}
          {parseContent.GOODS && (
            <div className={topic.goods}>
              <ProductItem
                image={parseContent?.GOODS?.imagePath}
                amount={parseContent?.GOODS?.price}
                title={parseContent?.GOODS?.title}
                onClick={() => onBuyClick(parseContent.GOODS.detailContent)}
              />
              <Button
                className={topic.buyBtn}
                type="danger"
                onClick={() => onBuyClick(parseContent.GOODS.detailContent)}
              >
                <div className={topic.buyContent}>
                  <Icon className={topic.buyIcon} name="ShoppingCartOutlined" size={20}></Icon>
                  <span className={topic.buyText}>购买商品</span>
                </div>
              </Button>
            </div>
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

          {/* 付费附件：不能免费查看付费帖 && 需要付费 && 不是作者 && 没有付费 */}
          {needAttachmentPay && (
            <div style={{ textAlign: 'center' }} onClick={onContentClick}>
              <Button className={topic.payButton} type="primary" size="large">
                <div className={topic.pay}>
                  <Icon className={topic.payIcon} name="GoldCoinOutlined" size={18}></Icon>
                  支付{attachmentPrice}元查看附件
                </div>
              </Button>
            </div>
          )}

          {/* 标签 */}
          {(parentCategoryName || categoryName) && (
            <div className={topic.tag} onClick={onTagClick}>
              {parentCategoryName ? `${parentCategoryName}/${categoryName}` : categoryName}
            </div>
          )}

          {/* 帖子付费：不能免费查看付费帖 && 需要付费 && 不是作者 && 没有付费 */}
          {!canFreeViewPost && isThreadPay && !isSelf && !isPayed && (
            <div style={{ textAlign: 'center' }} onClick={onContentClick}>
              <Button className={topic.payButton} type="primary" size="large">
                <div className={topic.pay}>
                  <Icon className={topic.payIcon} name="GoldCoinOutlined" size={18}></Icon>
                  支付{threadPrice}元查看剩余内容
                </div>
              </Button>
            </div>
          )}

          {/* 打赏 */}
          {canBeReward && isApproved && !isSelf && (
            <Button onClick={onRewardClick} className={topic.rewardButton} type="primary" size="large">
              <div className={topic.buttonIconText}>
                <Icon className={topic.buttonIcon} name="HeartOutlined" size={19}></Icon>
                <span className={topic.buttonText}>打赏</span>
              </div>
            </Button>
          )}
        </div>

        {/* 点赞分享 */}
        <div className={topic.footer}>
          <div className={topic.thumbs}>
            <div className={topic.likeReward}>
              <Tip
                tipData={tipData}
                imgs={threadStore?.threadData?.likeReward?.users || []}
                showCount={10}
                platform="pc"
              ></Tip>
            </div>
            <span>{threadStore?.threadData?.likeReward?.likePayCount || ''}</span>
          </div>
          {threadStore?.threadData?.likeReward?.shareCount > 0 && (
            <span className={topic.share}>{threadStore?.threadData?.likeReward?.shareCount}次分享</span>
          )}
        </div>

        <Divider className={topic.divider}></Divider>

        {/* 操作按钮 */}
        {
          isApproved && (
            <div className={topic.bottomOperate}>
              <div
                className={classnames(topic.item, threadStore?.threadData?.isLike && topic.active)}
                onClick={debounce(onLikeClick, 500)}
              >
                <Icon name="LikeOutlined"></Icon>
                <span>赞</span>
              </div>
              <div
                className={classnames(topic.item, threadStore?.threadData?.isFavorite && topic.active)}
                onClick={debounce(onCollectionClick, 500)}
              >
                <Icon name="CollectOutlined"></Icon>
                <span>收藏</span>
              </div>
              <div className={classnames(topic.item)} onClick={debounce(onShareClick, 500)}>
                <Icon name="ShareAltOutlined"></Icon>
                <span>分享</span>
              </div>
            </div>
          )}
      </div>
    );
  }),
);
