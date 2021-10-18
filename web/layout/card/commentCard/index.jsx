import React from 'react';
import Avatar from '@components/avatar';
import { diffDate } from '@common/utils/diff-date';
import { observer, inject } from 'mobx-react';
import ImageDisplay from '@components/thread/image-display';
import classNames from 'classnames';
import PostContent from '@components/thread/post-content';
import styles from './index.module.scss';

@inject('comment')
@inject('card')

@observer
class CommentCard extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.card.setImgReady();
  }

  render() {
    const { commentDetail: data } = this.props.comment;

    console.log(data);

    const { groups } = data?.user || {};
    return (
        <div className = {styles.commentList}>
          <div className={styles.content}>
            <div className={styles.commentListAvatar} onClick={() => this.avatarClick()}>
              {/* 头像和昵称*/}
              <Avatar
                image={
                  (data?.user?.nickname || data?.user?.userName) && data?.user?.avatar
                }
                name={data?.user?.nickname || '异'}
                circle={true}
              ></Avatar>
            </div>
            {/* 评论内容*/}
            <div className={styles.commentListContent}>
              <div className={`${styles.commentListContentText}`}>
                <div className={styles.commentHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.commentListName}>
                      {data?.user?.nickname  || '用户异常'}
                    </div>
                    {!!groups?.isDisplay && (
                      <div className={styles.groups}>{groups?.name || groups?.groupName}</div>
                    )}
                  </div>
                </div>
                <div className={classNames(styles.commentListText)}>
                  <PostContent
                    onRedirectToDetail={() => this.toCommentDetail()}
                    content={data?.content}
                    customHoverBg={true}
                  ></PostContent>
                </div>

                {/* 图片展示 */}
                {data?.images.length > 0 && (
                  <div className={styles.imageDisplay}>
                    <ImageDisplay platform="h5" imgData={data?.images} />
                  </div>
                )}
              </div>
              {data?.user && (
                <div className={styles.commentListFooter}>
                  <div className={styles.commentBtn}>
                    <div className={styles.commentTime}>{diffDate(data.createdAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    );
  }
}

export default CommentCard;
