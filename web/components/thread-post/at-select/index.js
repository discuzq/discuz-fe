/**
 * at选择弹框组件。默认展示相互关注人员，搜索关键字按照站点全体人员查询
 * @prop {boolean} visible 是否显示弹出层
 * @prop {function} onCancel 取消
 * @prop {function} getAtList 确定
 */
import React, { Component } from 'react';
import { Popup, Input, Checkbox, Avatar, Button, Icon, Toast } from '@discuzq/design';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import DDialog from '@components/dialog';
import List from '@components/list';

import stringToColor from '@common/utils/string-to-color';

@inject('threadPost')
@inject('search')
@observer
class AtSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keywords: '', // 搜索关键字
      checkUser: [], // 当前选择的at人
      page: 1,
      perPage: 10,
      finish: false,
    };
    this.timer = null;
  }

  componentDidMount() {
    this.fetchFollow();
  }

  async fetchFollow() {
    const { threadPost } = this.props;
    const { page, perPage } = this.state;
    const ret = await threadPost.fetchFollow({ page, perPage });
    if (ret?.code === 0) {
      this.setState({
        page: page + 1,
        finish: page * perPage > threadPost.followsTotalCount,
      });
    } else {
      this.setState({ finish: true })
      Toast.error({ content: ret.msg });
    }
  }

  async fetchAllUser() {
    const { search } = this.props;
    const { page, perPage, keywords } = this.state;
    const ret = await search.getUsersList({ search: keywords, type: 'username', page, perPage });
    const { code, data } = ret;
    if (code === 0) {
      this.setState({
        page: page + 1,
        finish: page * perPage >= data?.totalCount,
      });
    } else {
      this.setState({ finish: true });
      Toast.error({ content: ret.msg });
    }
  }

  // 更新搜索关键字,搜索用户
  updateKeywords(val = "") {
    this.setState({
      keywords: val,
      // checkUser: [], // 重新搜索时不清空已选用户
      page: 1,
      finish: false,
    });
    this.searchInput();
  }

  // 搜索用户
  searchInput() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.state.keywords ? this.fetchAllUser() : this.fetchFollow();
    }, 300);
  }

  onScrollBottom = () => {
    if (this.state.page === 1) return; // 阻止首次重复请求
    return this.state.keywords ? this.fetchAllUser() : this.fetchFollow();
  }

  // 取消选择
  handleCancel = () => {
    this.props.onCancel();
  };

  // 确认选择
  submitSelect() {
    if (this.state.checkUser.length === 0) {
      return;
    }
    this.props.getAtList(this.state.checkUser);
    this.props.onCancel();
  }

  // 获取显示文字头像的背景色
  getBackgroundColor = (name) => {
    const character = name ? name.charAt(0).toUpperCase() : "";
    return stringToColor(character);
  }

  formatData = (item) => {
    const isFollow = this.state.keywords === '';
    const avatar = isFollow ? item?.user?.avatar : item.avatar;
    const username = isFollow ? item?.user?.userName : item.username;
    const groupName = isFollow ? item?.group?.groupName : item.groupName;
    const userId = isFollow ? item.user?.pid : item.userId;
    return { avatar, username, groupName, userId };
  }

  renderItem() {
    const { threadPost, search } = this.props;
    const data = this.state.keywords ? (search.users?.pageData || []) : (threadPost.follows || []);

    if (data.length === 0) return null;
    return data.map((item) => {
      const { avatar, username, groupName, userId } = this.formatData(item);

      return (
        <div className={styles['at-item']} key={userId}>
          <div className={styles['at-item__inner']} >
            <Checkbox name={username}>
              <div className={styles.avatar}>
                {avatar
                  ? <Avatar image={avatar} />
                  : <Avatar
                    text={username}
                    style={{
                      backgroundColor: `#${this.getBackgroundColor(username)}`,
                    }}
                  />
                }
              </div>
              <div className={styles.info}>
                <div className={styles.username}>{username}</div>
                <div className={styles.group}>{groupName}</div>
              </div>
            </Checkbox>
          </div>
        </div>
      );
    });
  }

  render() {
    const { pc, visible } = this.props;
    const { keywords, checkUser, finish } = this.state;

    const content = (
      <div className={styles.wrapper} onClick={e => e.stopPropagation()}>

        {/* top */}
        <div className={styles.header}>
          <div className={styles['input-box']}>
            {!pc && <div className={styles['icon-box']}>
              <Icon className={styles['search-icon']} name="SearchOutlined" size={16}></Icon>
            </div>}
            <Input
              value={keywords}
              placeholder='选择好友或直接输入圈友'
              onChange={e => this.updateKeywords(e.target.value)}
            />
            {!pc && keywords &&
              <div className={styles['icon-box']} onClick={() => this.updateKeywords()}>
                <Icon className={styles['delete-icon']} name="WrongOutlined" size={16}></Icon>
              </div>
            }
          </div>
          {!pc &&
            <div className={styles['btn-cancel']} onClick={this.handleCancel}>取消</div>
          }
        </div>

        {/* list */}
        <Checkbox.Group
          className={styles['check-box']}
          value={checkUser}
          onChange={val => this.setState({ checkUser: val })}
        >
          <List
            className={styles.list}
            wrapperClass={styles['list__inner']}
            height={pc ? 'auto' : 'calc(100vh - 120px)'}
            noMore={finish}
            onRefresh={this.onScrollBottom}
          >
            {this.renderItem()}
          </List>
        </Checkbox.Group>

        {/* 确认按钮 */}
        <div className={styles['btn-container']}>
          <Button
            className={checkUser.length > 0 ? styles.selected : ''}
            onClick={() => this.submitSelect()}
          >
            {checkUser.length ? `@ 已选(${checkUser.length})` : '尚未选'}
          </Button>
        </div>
      </div >
    );

    if (pc) return (
      <DDialog
        visible={visible}
        className={styles.pc}
        onClose={this.handleCancel}
        isCustomBtn={true}
        title="@圈友"
      >
        {content}
      </DDialog>
    );

    return (
      <Popup
        className={`${styles.popup}`}
        position="center"
        visible={visible}
      >
        {content}
      </Popup>
    );
  }
}

AtSelect.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  getAtList: PropTypes.func.isRequired,
};

AtSelect.defaultProps = {
  visible: false,
  onCancel: () => { },
  getAtList: () => { },
};

export default AtSelect;
