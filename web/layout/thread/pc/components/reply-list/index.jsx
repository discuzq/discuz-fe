import React from 'react';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import { diffDate } from '@common/utils/diff-date';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Icon } from '@discuzq/design';
import CommentInput from '../comment-input/index';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import ImageDisplay from '@components/thread/image-display';
import { debounce } from '@common/utils/throttle-debounce';

@observer
export default class ReplyList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowInput: this.props.isShowInput, // 是否显示输入框
      placeholder: '输入你的回复',
    };
  }

  // 跳转至评论详情
  toCommentDetail() {
    console.log('跳至评论详情');
  }

  filterContent() {
    let newContent = this.props?.data?.content || '';
    newContent = s9e.parse(newContent);
    newContent = xss(newContent);

    return newContent;
  }

  likeClick() {
    typeof this.props.likeClick === 'function' && this.props.likeClick();
  }
  replyClick() {
    const userName = this.props.data?.user?.nickname || this.props.data?.user?.userName;

    this.setState({
      isShowInput: !this.state.isShowInput,
      placeholder: userName ? `回复${userName}` : '请输入内容',
    });
    typeof this.props.replyClick === 'function' && this.props.replyClick();
  }
  deleteClick() {
    typeof this.props.deleteClick === 'function' && this.props.deleteClick();
  }

  generatePermissions(data = {}) {
    return {
      canApprove: data.canApprove || false,
      canDelete: data.canDelete || false,
      canEdit: data.canEdit || false,
      canHide: data.canLike || false,
      canLike: data.canLike || false,
    };
  }

  render() {
    const { canLike, canDelete } = this.generatePermissions(this.props.data);

    return (
      <div className={styles.replyList}>
        <div className={styles.replyListAvatar} onClick={this.props.avatarClick('2')}>
          <Avatar
            image={this.props?.data?.user?.avatar}
            name={this.props?.data?.user?.nickname || this.props?.data?.user?.userName || ''}
            circle={true}
            userId={this.props?.data?.user?.id}
            isShowUserInfo={true}
            size="small"
          ></Avatar>
        </div>

        <div className={styles.replyListContent}>
          <div className={styles.replyListContentText}>
            <div className={styles.replyListName}>
              {this.props.data?.user?.nickname || this.props.data?.user?.userName || '用户异常'}
            </div>
            <div className={styles.replyListText}>
              {this.props.data.commentUserId && this.props.data?.commentUser ? (
                <div className={styles.commentUser}>
                  <div className={styles.replyedAvatar} onClick={this.props.avatarClick()}>
                    <Avatar
                      className={styles.avatar}
                      image={this.props.data.commentUser.avatar}
                      name={this.props.data.commentUser.nickname || this.props.data.commentUser.userName || ''}
                      circle={true}
                      userId={this.props.data.commentUser.id}
                      isShowUserInfo={true}
                      size="mini"
                    ></Avatar>
                  </div>
                  <span className={styles.replyedUserName}>
                    {this.props.data.commentUser.nickname || this.props.data.commentUser.userName}
                  </span>
                </div>
              ) : (
                ''
              )}
              <div
                className={classnames(styles.content, this.props.isShowOne && styles.isShowOne)}
                dangerouslySetInnerHTML={{ __html: this.filterContent() }}
              ></div>

              {/* 图片展示 */}
              {this.props.data?.images || this.props.data?.attachments ? (
                <div className={styles.imageDisplay}>
                  <ImageDisplay platform="pc" imgData={this.props.data?.images || this.props.data?.attachments} />
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
          
          <div className={styles.replyListFooter}>
            <div className={styles.replyTime}>{diffDate(this.props.data.createdAt)}</div>

            {/* 操作按钮 */}
            {this.props.data?.user && (
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
                {canDelete && (
                  <div className={styles.replyDelete} onClick={() => this.deleteClick()}>
                    <Icon className={styles.icon} name="DeleteOutlined"></Icon>
                    <span>删除</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 回复输入框 */}
          {this.props.isShowInput && this.state.isShowInput && (
            <div className={styles.commentInput}>
              <CommentInput
                height="label"
                onSubmit={(value, imageList) => this.props.onSubmit(value, imageList)}
                placeholder={this.state.placeholder}
              ></CommentInput>
            </div>
          )}
        </div>
      </div>
    );
  }
}
