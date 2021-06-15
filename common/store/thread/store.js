import { observable, computed } from 'mobx';

class ThreadStore {
  constructor(props) {
    this.threadData = props?.thread;
  }
  @observable threadData = null; // 帖子信息
  @observable commentList = null; // 评论列表数据
  @observable totalCount = 0; // 评论列表总条数
  @observable authorInfo = null; // 作者信息
  @observable isPositionToComment = false; // 是否定位到评论位置
  @observable checkUser = null; // @ren数据

  @observable isCommentListError = false;
  @observable isAuthorInfoError = false;

  @observable scrollDistance = 0;

  // 是否帖子数据准备好
  @computed get isReady() {
    return !!this.threadData?.id;
  }

  // 是否评论数据准备好
  @computed get isCommentReady() {
    return !!this.commentList;
  }

  // 是否收藏
  @computed get isFavorite() {
    return !!this.threadData?.isFavorite;
  }

  // 是否加精
  @computed get isEssence() {
    return !!this.threadData?.displayTag?.isEssence;
  }

  // 是否还有更多
  @computed get isNoMore() {
    return this.commentList?.length >= this.totalCount;
  }

  // 帖子标题
  @computed get title() {
    return this.threadData?.title.slice(0, 15) || this.threadData?.categoryName || '';
  }
}

export default ThreadStore;
