import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { Icon, Input, Button, Dropdown } from '@discuzq/design';
import Avatar from '@components/avatar';
import { withRouter } from 'next/router';
import goToLoginPage from '@common/utils/go-to-login-page';
import Router from '@discuzq/sdk/dist/router';
import clearLoginStatus from '@common/utils/clear-login-status';

@inject('site')
@inject('user')
@observer
class Header extends React.Component {
  constructor(props) {
    super(props);

    const keyword = this.props.router.query.keyword || '';
    this.state = {
      value: keyword,
    };
  }

  // state = {
  //   value: ''
  // }

  onChangeInput = (e) => {
    this.setState({
      value: e,
    });
  };

  handleSearch = (e) => {
    const { value = '' } = this.state;
    const { onSearch } = this.props;
    if (!onSearch) {
      Router.push({ url: `/search?keyword=${value}` });
    } else {
      onSearch(value);
    }
  };

  handleIconClick = (e) => {
    const { value = '' } = this.state;
    const { onSearch } = this.props;
    if (!onSearch) {
      Router.push({ url: `/search?keyword=${value}` });
    } else {
      onSearch(value);
    }
  };

  handleRouter = (url) => {
    this.props.router.push(url);
  };
  // 登录
  toLogin = () => {
    goToLoginPage({ url: '/user/login' });
  };
  toRegister = () => {
    Router.push({ url: '/user/register' });
  };

  renderHeaderLogo() {
    const { site } = this.props;
    if (site.setSite && site.setSite.siteLogo && site.setSite.siteLogo !== '') {
      return <img className={styles.siteLogo} src={site.setSite.siteLogo} onClick={() => this.handleRouter('/')} />;
    }
    return <img className={styles.siteLogo} src="/dzq-img/admin-logo-pc.png" onClick={() => this.handleRouter('/')} />;
  }

  dropdownUserUserCenterActionImpl = () => {
    this.props.router.push('/my');
  };

  dropdownUserLogoutActionImpl = () => {
    clearLoginStatus();
    window.location.replace('/');
  }

  dropdownActionImpl = (action) => {
    if (action === 'userCenter') {
      this.dropdownUserUserCenterActionImpl();
    } else if (action === 'logout') {
      this.dropdownUserLogoutActionImpl();
    }
  }

  renderUserInfo() {
    // todo 跳转
    const { user, site } = this.props;
    if (user && user.userInfo && user.userInfo.id) {
      return (
        <Dropdown
          style={{ display: 'inline-block' }}
          menu={
            <Dropdown.Menu>
              <Dropdown.Item id="userCenter">个人中心</Dropdown.Item>
              <Dropdown.Item id="logout">
                退出登录
              </Dropdown.Item>
            </Dropdown.Menu>
          }
          placement="right"
          hideOnClick={true}
          trigger="hover"
          onChange={this.dropdownActionImpl}
        >
          <div className={styles.userInfo}>
            {/* onClick={this.handleUserInfoClick} */}
            <Avatar
              className={styles.avatar}
              name={user.userInfo.username}
              circle={true}
              image={user.userInfo?.avatarUrl}
              onClick={() => {}}
            ></Avatar>
            <p className={styles.userName}>{user.userInfo.nickname || ''}</p>
          </div>
        </Dropdown>
      );
    }

    return (
      <div className={styles.userInfo}>
        <Button className={styles.userBtn} type="primary" onClick={this.toLogin}>
          登录
        </Button>
        {site.isRegister && (
          <Button onClick={this.toRegister} className={`${styles.userBtn} ${styles.registerBtn}`}>
            注册
          </Button>
        )}
      </div>
    );
  }

  iconClickHandle(type) {
    console.log(type);
  }

  render() {
    const { site, user } = this.props;

    return (
      <div className={styles.header}>
        <div className={styles.headerFixedBox}>
          <div className={styles.headerContent}>
            <div className={styles.left}>
              {this.renderHeaderLogo()}
              <div className={styles.inputBox}>
                <Input
                  placeholder="搜索"
                  icon="SearchOutlined"
                  value={this.state.value}
                  onEnter={this.handleSearch}
                  onChange={e => this.onChangeInput(e.target.value)}
                  onIconClick={this.handleIconClick}
                />
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.iconList}>
                <div className={styles.iconItem} onClick={() => this.handleRouter('/')}>
                  <Icon
                    onClick={() => {
                      this.iconClickHandle('home');
                    }}
                    name="HomeOutlined"
                    size={15}
                  />
                  <p className={styles.iconText}>首页</p>
                </div>
                <div className={styles.iconItem} onClick={() => this.handleRouter('/message')}>
                  <Icon
                    onClick={() => {
                      this.iconClickHandle('home');
                    }}
                    name="MailOutlined"
                    size={17}
                  />
                  <p className={styles.iconText}>消息</p>
                </div>
                <div className={styles.iconItem} onClick={() => this.handleRouter('/search')}>
                  <Icon
                    onClick={() => {
                      this.iconClickHandle('home');
                    }}
                    name="FindOutlined"
                    size={17}
                  />
                  <p className={styles.iconText}>发现</p>
                </div>
              </div>
              <div className={styles.border}></div>
              {this.renderUserInfo()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Header);
