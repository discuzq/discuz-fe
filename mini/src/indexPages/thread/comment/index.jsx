import React from 'react';
import { inject } from 'mobx-react';
// import { ToastProvider } from '@discuzq/design/dist/components/toast/ToastProvider';
import Page from '@components/page';
import Router from '@discuzq/sdk/dist/router';
import { readCommentDetail } from '@server';
import { getCurrentInstance } from '@tarojs/taro';
import CommentMiniPage from '../../../layout/thread/comment/index';
import ErrorMiniPage from '../../../layout/error/index';

@inject('site')
@inject('comment')
class CommentDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isServerError: false,
      serverErrorMsg: '',
    };
  }

  async componentWillUnmount() {
    this.props.comment.reset();
  }

  async componentDidShow() {
    const { id, threadId, postId } = getCurrentInstance().router.params;
    
    if (threadId) {
      this.props.comment.setThreadId(threadId);
    }

    if (postId) {
      this.props.comment.setPostId(Number(postId));
    }

    if (id) {
      const res = await readCommentDetail({ params: {
        perPage: 20,
        pid: Number(id) 
      } });

      if (res.code !== 0) {
        // 404
        if (res.code === -4004) {
          Router.replace({ url: '/subPages/404/index' });
          return;
        }

        if (res.code > -5000 && res.code < -4000) {
          this.setState({
            serverErrorMsg: res.msg,
          });
        }

        this.setState({
          isServerError: true,
        });
        return;
      }

      this.props.comment.setCommentDetail(res.data);
    }
  }

  render() {
    return this.state.isServerError ? (
      <ErrorMiniPage text={this.state.serverErrorMsg}/>
    ) : (
      <Page>
        {/* <ToastProvider> */}
          <CommentMiniPage />
        {/* </ToastProvider> */}
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default CommentDetail;
