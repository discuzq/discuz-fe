import React from 'react';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import ReplyList from '../reply-list/index';
import { diffDate } from '@common/utils/diff-date';
import { observer } from 'mobx-react';
import { Icon, Divider } from '@discuzq/design';
import classnames from 'classnames';
import CommentInput from '../comment-input/index';
import RewardDisplay from '@components/thread-detail-pc/reward-display';
import RedPacketDisplay from '@components/thread-detail-pc/red-packet-display';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import ImageDisplay from '@components/thread/image-display';
import PostContent from '@components/thread/post-content';
import { debounce } from '@common/utils/throttle-debounce';
import { urlToLink } from '@common/utils/replace-url-to-a';

@observer
class CommentList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isShowOne: this.props.isShowOne || false, // 是否只显示一条评论回复
      isFirstDivider: false, // 第一条评论下的回复是否分割线
      isShowInput: this.props.isShowInput, // 是否显示输入框
      replyId: null,
      placeholder: '输入你的回复',
    };
    this.needReply = this.props.data.lastThreeComments; // 评论的回复
  }

  toCommentDetail = () => {
    if (this.state.isShowOne) {
      typeof this.props.onCommentClick === 'function' && this.props.onCommentClick();
    }
  };

  filterContent() {
    let newContent = this.props?.data?.content || '';
    newContent = s9e.parse(newContent);
    newContent = xss(newContent);

    return newContent;
  }

  // 点击头像
  avatarClick() {
    typeof this.props?.avatarClick === 'function' && this.props.avatarClick(this.props.data?.user?.id);
  }

  // 点击评论赞
  likeClick() {
    typeof this.props.likeClick === 'function' && this.props.likeClick();
  }

  // 点击评论回复
  replyClick() {
    const userName = this.props.data?.user?.nickname || this.props.data?.user?.userName;

    this.setState({
      isShowInput: !this.state.isShowInput,
      replyId: null,
      placeholder: userName ? `回复${userName}` : '请输入内容',
    });
    typeof this.props.replyClick === 'function' && this.props.replyClick();
  }

  // 点击评论删除
  deleteClick() {
    typeof this.props.deleteClick === 'function' && this.props.deleteClick();
  }

  // 点击评论编辑
  editClick() {
    typeof this.props.editClick === 'function' && this.props.editClick();
  }

  // 点击回复赞
  replyLikeClick(data) {
    typeof this.props.replyLikeClick === 'function' && this.props.replyLikeClick(data);
  }

  // 点击回复回复
  replyReplyClick(data) {
    this.setState({
      replyId: data?.id,
    });

    typeof this.props.replyReplyClick === 'function' && this.props.replyReplyClick(data);
  }

  // 点击回复删除
  replyDeleteClick(data) {
    this.setState({
      replyId: data?.id,
    });
    typeof this.props.replyDeleteClick === 'function' && this.props.replyDeleteClick(data);
  }

  reployAvatarClick(data) {
    typeof this.props.reployAvatarClick === 'function' && this.props.reployAvatarClick(data);
  }

  reportClick(data) {
    typeof this.props.reportClick === 'function' && this.props.reportClick(data);
  }

  // 点击评论列表用户头像
  replyAvatarClick(data, floor) {
    typeof this.props.replyAvatarClick === 'function' && this.props.replyAvatarClick(data, floor);
  }

  async onSubmit(value, imageList) {
    if (typeof this.props.onSubmit === 'function') {
      const success = await this.props.onSubmit(value, imageList);
      if (success) {
        this.setState({
          replyId: null,
        });
      }
    }
  }

  generatePermissions(data = {}) {
    return {
      canApprove: data.canApprove || false,
      canDelete: data.canDelete || false,
      canEdit: data.canEdit || false,
      canHide: data.canHide || false,
      canLike: data.canLike || false,
    };
  }

  render() {
    const { canDelete, canEdit, canLike, canHide } = this.generatePermissions(this.props.data);
    const { groups } = this.props.data?.user || {};
    console.log(this.props.isAnonymous);
    // 评论内容是否通过审核
    const isApproved = this.props?.data?.isApproved === 1;
    const isSelf = this.props.threadId === this.props?.data?.userId;
    return (
      <div className={`${styles.commentList} dzq-comment`}>
        {this.props.data?.rewards || this.props.data?.redPacketAmount ? (
          <div className={styles.header}>
            {this.props.data?.rewards ? <RewardDisplay number={this.props.data.rewards}></RewardDisplay> : ''}

            {this.props.data?.redPacketAmount ? (
              <div className={styles.redpacket}>
                <RedPacketDisplay number={this.props.data.redPacketAmount}></RedPacketDisplay>
              </div>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
        <div className={styles.content}>
          <div className={styles.commentListAvatar}>
            <Avatar
              image={
                (this.props.data?.user?.nickname || this.props.data?.user?.userName) && this.props.data?.user?.avatar
              }
              name={this.props.data?.user?.nickname || this.props.data?.user?.userName || '异'}
              circle={true}
              userId={this.props.data?.user?.id}
              isShowUserInfo={this.props.isShowOne}
              className={styles.avatar}
              onClick={() => this.avatarClick()}
            ></Avatar>
          </div>
          <div className={styles.commentListContent}>
            {/* 评论内容 */}
            <div
              className={classnames(
                styles.commentListContentText,
                this.props.isShowOne && styles.hover,
                this.props.active && styles.active,
              )}
            >
              <div className={styles.commentHeader}>
                <div className={styles.userInfo}>
                  <div className={styles.commentListName}>
                    {this.props.data?.user?.nickname || this.props.data?.user?.userName || '用户异常'}
                  </div>
                  {(isSelf && !this.props.isAnonymous) && (
                    <div className={styles.masterBox}>
                      <span className={styles.masterText}>楼主</span>
                    </div>
                  )}
                  {!!groups?.isDisplay  && (
                      <div className={styles.groups}>{groups?.name || groups?.groupName}</div>
                  )}
                </div>
                {!isApproved ? <div className={styles.isApproved}>审核中</div> : <div></div>}
              </div>
              <div className={classnames(styles.commentListText)}>
                <PostContent
                  onRedirectToDetail={() => this.toCommentDetail()}
                  useShowMore={!!this.state.isShowOne}
                  content={this.props?.data?.content}
                  customHoverBg={true}
                ></PostContent>
              </div>
              {/* <div
                onClick={() => this.toCommentDetail()}
                className={classnames(styles.commentListText, this.props.isShowOne && styles.isShowOne)}
                dangerouslySetInnerHTML={{ __html: this.filterContent() }}
              ></div> */}
              {/* 图片展示 */}
              {this.props.data?.images ? (
                <div className={styles.imageDisplay}>
                  <ImageDisplay platform="pc" imgData={this.props.data?.images} />
                </div>
              ) : (
                ''
              )}
            </div>

            {this.props.data?.user && (
              <div className={styles.commentListFooter}>
                {/* 操作按钮 */}
                {!this.props.isFirstDivider && (
                  <div className={styles.commentBtn}>
                    <div className={styles.commentTime}>{diffDate(this.props.data.createdAt)}</div>
                    <div className={styles.extraBottom}>
                      <div
                        className={classnames(styles.commentLike, this.props?.data?.isLiked && styles.active)}
                        onClick={debounce(() => this.likeClick(canLike), 500)}
                      >
                        <Icon className={styles.icon} name="LikeOutlined"></Icon>
                        赞&nbsp;{this.props?.data?.likeCount > 0 ? this.props.data.likeCount : ''}
                      </div>
                      <div
                        className={classnames(
                          styles.commentReply,
                          this.props.isShowInput && this.state.isShowInput && styles.active,
                        )}
                        onClick={() => this.replyClick()}
                      >
                        <Icon className={styles.icon} name="MessageOutlined"></Icon>
                        <span>回复</span>
                      </div>
                      {this.props.isShowAdopt ? (
                        <div className={styles.commentAdopt} onClick={() => this.props.onAboptClick()}>
                          <Icon className={styles.icon} name="ExactnessOutlined"></Icon>
                          <span>采纳</span>
                        </div>
                      ) : (
                        ''
                      )}
                      {/* {canEdit && (
                          <div className={styles.revise} onClick={() => this.editClick()}>
                            编辑
                          </div>
                        )} */}
                      {canHide && (
                        <div className={styles.commentDelete} onClick={() => this.deleteClick()}>
                          <Icon className={styles.icon} name="DeleteOutlined"></Icon>
                          <span>删除</span>
                        </div>
                      )}

                      <div className={styles.commentReport} onClick={() => this.reportClick()}>
                        <Icon className={styles.icon} name="WarnOutlined"></Icon>
                        <span>举报</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 回复输入框 */}
                {this.props.isShowInput && this.state.isShowInput && (
                  <div className={styles.commentInput}>
                    <CommentInput
                      height="label"
                      onSubmit={(value, imageList) => this.onSubmit(value, imageList)}
                      placeholder={this.state.placeholder}
                    ></CommentInput>
                  </div>
                )}
                {this.props.data?.replyCount - 1 > 0 && this.state.isShowOne ? (
                  <div className={styles.moreReply} onClick={() => this.toCommentDetail()}>
                    查看之前{this.props.data?.replyCount - 1}条回复...
                  </div>
                ) : (
                  ''
                )}

                {this.props.isFirstDivider && <Divider className={styles.divider}></Divider>}

                {/* 回复列表 */}
                {this.needReply?.length > 0 && (
                  <div className={styles.replyList}>
                    {this.state.isShowOne ? (
                      <ReplyList
                        threadId={this.props.threadId}
                        data={this.needReply[0]}
                        key={this.needReply[0].id}
                        isShowOne={true}
                        avatarClick={floor => this.replyAvatarClick(this.needReply[0], floor)}
                        likeClick={() => this.replyLikeClick(this.needReply[0])}
                        replyClick={() => this.replyReplyClick(this.needReply[0])}
                        deleteClick={() => this.replyDeleteClick(this.needReply[0])}
                        toCommentDetail={() => this.toCommentDetail()}
                        onSubmit={(value, imageList) => this.onSubmit(value, imageList)}
                        isShowInput={this.state.replyId && this.state.replyId === this.needReply[0].id}
                        canPublish={this.props.canPublish}
                        isAnonymous={this.props.isAnonymous}
                      ></ReplyList>
                    ) : (
                      (this.needReply || []).map((val, index) => (
                        <div key={val.id || index} ref={val.id === this.props.postId ? this.props.positionRef : null}>
                          <ReplyList
                            threadId={this.props.threadId}
                            data={val}
                            key={val.id || index}
                            avatarClick={floor => this.replyAvatarClick(val, floor)}
                            likeClick={() => this.replyLikeClick(val)}
                            replyClick={() => this.replyReplyClick(val)}
                            deleteClick={() => this.replyDeleteClick(val)}
                            toCommentDetail={() => this.toCommentDetail()}
                            onSubmit={(value, imageList) => this.onSubmit(value, imageList)}
                            isShowInput={this.state.replyId && this.state.replyId === val.id}
                            active={this.props.postId === val.id}
                            canPublish={this.props.canPublish}
                            isAnonymous={this.props.isAnonymous}
                          ></ReplyList>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default CommentList;
