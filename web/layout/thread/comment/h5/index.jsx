import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import Router from '@discuzq/sdk/dist/router';
import styles from './index.module.scss';
import comment from './index.module.scss';
import CommentList from '../../h5/components/comment-list/index';
import MorePopup from '../../h5/components/more-popup';
// import DeletePopup from '../../h5/components/delete-popup';
import DeletePopup from '@components/thread-detail-pc/delete-popup';
import Header from '@components/header';
import { Toast } from '@discuzq/design';
import InputPopup from '../../h5/components/input-popup';
import ReportPopup from '../../h5/components/report-popup';
import goToLoginPage from '@common/utils/go-to-login-page';

@inject('site')
@inject('user')
@inject('comment')
@inject('thread')
@observer
class CommentH5Page extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showReportPopup: false, // 举报弹框
      showMorePopup: false, // 是否弹出更多弹框
      showCommentInput: false, // 是否弹出评论框
      commentSort: true, // ture 评论从旧到新 false 评论从新到旧
      showDeletePopup: false, // 是否弹出删除弹框
      showReplyDeletePopup: false, // 是否弹出回复删除弹框
      inputText: '请输入内容', // 默认回复框placeholder内容
    };

    this.commentData = null;
    this.replyData = null;
    this.recordCommentLike = {
      // 记录当前评论点赞状态
      id: null,
      status: null,
    };
    this.recordReplyLike = {
      // 记录当前评论点赞状态
      id: null,
      status: null,
    };

    // 举报内容选项
    this.reportContent = ['广告垃圾', '违规内容', '恶意灌水', '重复发帖'];
    this.inputText = '其他理由...';

    this.positionRef = React.createRef();
    this.isPositioned = false;
  }

  componentDidUpdate() {
    // 滚动到指定的评论定位位置
    if (this.props.comment?.postId && !this.isPositioned && this.positionRef?.current) {
      this.isPositioned = true;
      setTimeout(() => {
        this.positionRef.current.scrollIntoView();
      }, 1000);
    }
  }

  // 点击更多
  onMoreClick() {
    this.setState({ showMorePopup: true });
  }

  // 更多中的操作
  onOperClick = (type) => {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    this.setState({ showMorePopup: false });

    // 编辑
    if (type === 'edit') {
      // this.onEditClick(this.props.comment.commentDetail);
    }

    // 删除
    if (type === 'delete') {
      // this.commentData = this.state.commentData;
      this.setState({ showDeletePopup: true });
    }

    // 举报
    if (type === 'report') {
      this.setState({ showReportPopup: true });
    }
  };

  // 点击评论的赞
  async likeClick(data) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (!data.id) return;

    if (this.recordCommentLike.id !== data.id) {
      this.recordCommentLike.status = null;
    }
    if (this.recordCommentLike.status !== data.isLiked) {
      this.recordCommentLike.status = data.isLiked;
      this.recordCommentLike.id = data.id;
    } else {
      return;
    }

    const params = {
      id: data.id,
      isLiked: !data.isLiked,
    };
    const { success, msg } = await this.props.comment.updateLiked(params, this.props.thread);

    if (success) {
      this.props.comment.setCommentDetailField('isLiked', params.isLiked);
      const likeCount = params.isLiked ? data.likeCount + 1 : data.likeCount - 1;
      this.props.comment.setCommentDetailField('likeCount', likeCount);
    }

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 点击回复的赞
  async replyLikeClick(reply) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }

    if (!reply.id) return;

    if (this.recordCommentLike.id !== reply.id) {
      this.recordCommentLike.status = null;
    }
    if (this.recordCommentLike.status !== reply.isLiked) {
      this.recordCommentLike.status = reply.isLiked;
      this.recordCommentLike.id = reply.id;
    } else {
      return;
    }

    const params = {
      id: reply.id,
      isLiked: !reply.isLiked,
    };
    const { success, msg } = await this.props.comment.updateLiked(params, this.props.comment);

    if (success) {
      this.props.comment.setReplyListDetailField(reply.id, 'isLiked', params.isLiked);
      const likeCount = params.isLiked ? reply.likeCount + 1 : reply.likeCount - 1;
      this.props.comment.setReplyListDetailField(reply.id, 'likeCount', likeCount);
    }

    if (!success) {
      Toast.error({
        content: msg,
      });
    }
  }

  // 点击评论的删除
  async deleteClick(data) {
    this.commentData = data;
    this.setState({
      showDeletePopup: true,
    });
  }

  // 确定删除
  onBtnClick() {
    this.deleteComment();
    this.setState({ showDeletePopup: false });
  }

  // 删除评论
  async deleteComment() {
    if (!this.props?.comment?.commentDetail?.id) return;
    const { success, msg } = await this.props.comment.delete(this.props.comment.commentDetail.id, this.props.thread);
    this.setState({
      showDeletePopup: false,
    });
    if (success) {
      Toast.success({
        content: '删除成功',
      });
      Router.back();
      return;
    }
    Toast.error({
      content: msg,
    });
  }

  // 点击回复的删除
  async replyDeleteClick(reply, comment) {
    this.commentData = comment;
    this.replyData = reply;
    this.setState({
      showReplyDeletePopup: true,
    });
  }

  //删除回复评论
  async replyDeleteComment() {
    if (!this.replyData.id) return;

    const params = {};
    if (this.replyData && this.commentData) {
      params.replyData = this.replyData; //本条回复信息
      params.commentData = this.commentData; //回复对应的评论信息
    }
    const { success, msg } = await this.props.comment.deleteReplyComment(params, this.props.thread);
    this.setState({
      showReplyDeletePopup: false,
    });
    if (success) {
      Toast.success({
        content: '删除成功',
      });
      return;
    }
    Toast.error({
      content: msg,
    });
  }

  // 点击评论的回复
  replyClick(comment) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    if (!this.props.canPublish()) return ;
    this.commentData = comment;
    this.replyData = null;
    this.setState({
      showCommentInput: true,
      inputText: comment?.user?.nickname ? `回复${comment.user.nickname}` : '请输入内容',
    });
  }

  // 点击回复的回复
  replyReplyClick(reply, comment) {
    if (!this.props.user.isLogin()) {
      Toast.info({ content: '请先登录!' });
      goToLoginPage({ url: '/user/login' });
      return;
    }
    if (!this.props.canPublish()) return ;
    this.commentData = null;
    this.replyData = reply;
    this.replyData.commentId = comment.id;

    this.setState({
      showCommentInput: true,
      inputText: reply?.user?.nickname ? `回复${reply.user.nickname}` : '请输入内容',
    });
  }

  // 创建回复评论+回复回复接口
  async createReply(val, imageList) {
    const valuestr = val.replace(/\s/g, '');
    // 如果内部为空，且只包含空格或空行
    if (!valuestr) {
      Toast.info({ content: '请输入内容' });
      return;
    }

    const { threadId: id } = this.props.comment;
    if (!id) return;

    const params = {
      id,
      content: val,
    };

    // 楼中楼回复
    if (this.replyData) {
      params.replyId = this.replyData.id;
      params.isComment = true;
      params.commentId = this.replyData.commentId;
      params.commentPostId = this.replyData.id;
    }
    // 回复评论
    if (this.commentData) {
      params.replyId = this.commentData.id;
      params.isComment = true;
      params.commentId = this.commentData.id;
    }

    if (imageList?.length) {
      params.attachments = imageList
        .filter((item) => item.status === 'success' && item.response)
        .map((item) => {
          const { id } = item.response;
          return {
            id,
            type: 'attachments',
          };
        });
    }

    const { success, msg, isApproved } = await this.props.comment.createReply(params, this.props.thread);

    if (success) {
      this.setState({
        showCommentInput: false,
        inputText: '请输入内容',
      });
      if (isApproved) {
        Toast.success({
          content: msg,
        });
      } else {
        Toast.warning({
          content: msg,
        });
      }
      return true;
    }

    Toast.error({
      content: msg,
    });
  }

  // 确定举报
  async onReportOk(val) {
    if (!val) return;

    const params = {
      threadId: this.props.comment.threadId,
      type: 2,
      reason: val,
      userId: this.props.user.userInfo.id,
      postId: this.props?.comment?.commentDetail?.id,
    };
    const { success, msg } = await this.props.thread.createReports(params);

    if (success) {
      Toast.success({
        content: '操作成功',
      });

      this.setState({ showReportPopup: false });
      return true;
    }

    Toast.error({
      content: msg,
    });
  }

  avatarClick(commentData) {
    const { userId } = commentData;
    if (!userId) return;
    this.props.router.push(`/user/${userId}`);
  }

  replyAvatarClick(reply, comment, floor) {
    if (floor === 2) {
      const { userId } = reply;
      if (!userId) return;
      this.props.router.push(`/user/${userId}`);
    }
    if (floor === 3) {
      const { commentUserId } = reply;
      if (!commentUserId) return;
      this.props.router.push(`/user/${commentUserId}`);
    }
  }

  render() {
    const { commentDetail: commentData, isReady } = this.props.comment;

    // 更多弹窗权限
    const morePermissions = {
      // canEdit: commentData?.canEdit,
      canEdit: false,
      canDelete: commentData?.canDelete,
      canEssence: false,
      canStick: false,
      isAdmini: this.props?.user?.isAdmini,
    };

    // 更多弹窗界面
    const moreStatuses = {
      isEssence: false,
      isStick: false,
    };

    return (
      <div className={styles.index}>
        <Header></Header>
        {/* <div className={styles.header}>
          <div className={styles.show}>
            {
              this.state.isShowReward
                ? <div className={styles.showGet}>
                  <div className={styles.icon}>悬赏图标</div>
                  <div className={styles.showMoneyNum}>
                    获得<span className={styles.moneyNumber}>5.20</span>元悬赏金
                    </div>
                </div> : ''
            }
            {
              this.state.isShowRedPacket
                ? <div className={styles.showGet}>
                  <div className={styles.icon}>红包图标</div>
                  <div className={styles.showMoneyNum}>
                    获得<span className={styles.moneyNumber}>5.20</span>元红包
                    </div>
                </div> : ''
            }
          </div>
        </div> */}

        {/* 内容 */}
        <div className={styles.content}>
          {isReady && (
            <CommentList
              data={commentData}
              likeClick={() => this.likeClick(commentData)}
              replyClick={() => this.replyClick(commentData)}
              avatarClick={() => this.avatarClick(commentData)}
              deleteClick={() => this.deleteClick(commentData)}
              replyLikeClick={(reply) => this.replyLikeClick(reply, commentData)}
              replyReplyClick={(reply) => this.replyReplyClick(reply, commentData)}
              replyAvatarClick={(reply, floor) => this.replyAvatarClick(reply, commentData, floor)}
              replyDeleteClick={(reply) => this.replyDeleteClick(reply, commentData)}
              onMoreClick={() => this.onMoreClick()}
              isHideEdit={true}
              postId={this.props.comment.postId}
              positionRef={this.positionRef}
            ></CommentList>
          )}
        </div>

        <div className={styles.footer}>
          {/* 评论弹层 */}
          <InputPopup
            visible={this.state.showCommentInput}
            inputText={this.state.inputText}
            onClose={() => this.setState({ showCommentInput: false })}
            onSubmit={(value, imageList) => this.createReply(value, imageList)}
            site={this.props.site}
          ></InputPopup>

          {/* 更多弹层 */}
          <MorePopup
            permissions={morePermissions}
            statuses={moreStatuses}
            visible={this.state.showMorePopup}
            onClose={() => this.setState({ showMorePopup: false })}
            onSubmit={() => this.setState({ showMorePopup: false })}
            onOperClick={(type) => this.onOperClick(type)}
          />

          {/* 删除弹层 */}
          <DeletePopup
            visible={this.state.showDeletePopup}
            onClose={() => this.setState({ showDeletePopup: false })}
            onBtnClick={() => this.deleteComment()}
          ></DeletePopup>

          {/* 删除回复弹层 */}
          <DeletePopup
            visible={this.state.showReplyDeletePopup}
            onClose={() => this.setState({ showReplyDeletePopup: false })}
            onBtnClick={() => this.replyDeleteComment()}
          />

          {/* 举报弹层 */}
          <ReportPopup
            reportContent={this.reportContent}
            inputText={this.inputText}
            visible={this.state.showReportPopup}
            onCancel={() => this.setState({ showReportPopup: false })}
            onOkClick={(data) => this.onReportOk(data)}
          ></ReportPopup>
        </div>
      </div>
    );
  }
}

export default withRouter(CommentH5Page);
