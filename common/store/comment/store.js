import { observable, computed } from 'mobx';

class CommentStore {
  constructor(props) {
    this.commentDetail = props?.comment;
  }
  @observable postId = null; // 回复id
  @observable commentDetail = null; // 评论信息
  @observable threadId = null; // 评论信息
  @observable authorInfo = null; // 作者信息
  @observable isAuthorInfoError = false;

  // 回复列表
  @computed get replyList() {
    return this.commentDetail?.commentPosts || [];
  }

  // 是否评论数据准备好
  @computed get isReady() {
    return !!this.commentDetail?.id;
  }

  // 内容
  @computed get content() {
    return this.commentDetail?.content;
  }
}

export default CommentStore;
