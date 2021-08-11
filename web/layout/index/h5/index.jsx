import React, { createRef, Fragment } from 'react';
import { inject, observer, Observer } from 'mobx-react';
import { Icon, Tabs, Spin } from '@discuzq/design';
// import ThreadContent from '@components/thread';
import HomeHeader from '@components/home-header';
import styles from './index.module.scss';
import TopNew from './components/top-news';
import FilterView from './components/filter-view';
import BaseLayout from '@components/base-layout';
import { getSelectedCategoryIds } from '@common/utils/handleCategory';
import wxAuthorization from '../../user/h5/wx-authorization';
// import VList from '@components/virtual-list/h5/index';
import classnames from 'classnames';
// import DynamicVList from './components/dynamic-vlist';
import dynamic from 'next/dynamic';
import DynamicLoading from '@components/dynamic-loading';

@inject('site')
@inject('user')
@inject('index')
@inject('baselayout')
@observer
class IndexH5Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isFinished: true,
      fixedTab: false,
    };
    this.listRef = createRef();
    // 用于获取顶部视图的高度
    this.headerRef = createRef(null);

    // 是否开启虚拟滚动
    this.enableVlist = true;
    this.handleScroll = this.handleScroll.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  DynamicVListLoading = dynamic(
    () => import('./components/dynamic-vlist'),
    { loading: (res) => (
            <div>
                <HomeHeader ref={this.headerRef} />
                <DynamicLoading data={res} style={{padding: '0 0 20px'}} loadComponent={
                  <div style={{width: '100%'}}>
                    <div className={styles.placeholder}>
                      <div className={styles.header}>
                        <div className={styles.avatar}/>
                        <div className={styles.box}/>
                      </div>
                      <div className={styles.content}/>
                      <div className={styles.content}/>
                      <div className={styles.footer}>
                        <div className={styles.box}/>
                        <div className={styles.box}/>
                        <div className={styles.box}/>
                      </div>
                    </div>
                    <div className={styles.placeholder}>
                      <div className={styles.header}>
                        <div className={styles.avatar}/>
                        <div className={styles.box}/>
                      </div>
                      <div className={styles.content}/>
                      <div className={styles.content}/>
                      <div className={styles.footer}>
                        <div className={styles.box}/>
                        <div className={styles.box}/>
                        <div className={styles.box}/>
                      </div>
                    </div>
                  </div>
                }/>
            </div>
        ) },
  )

  componentDidMount() {
    // 是否有推荐
    const isDefault = this.props.site.checkSiteIsOpenDefautlThreadListData();
    this.props.index.setNeedDefault(isDefault);
  }

  // 点击更多弹出筛选
  searchClick = () => {
    this.setState({ visible: true });
  };
  // 关闭筛选框
  onClose = () => {
    this.setState({ visible: false });
  };

  // 点击底部tabBar
  onClickTabBar = (data, index) => {
    if (index !== 0) {
      return;
    }
    this.changeFilter();
  };

  onClickTab = (id = '') => {
    this.changeFilter({ categoryids: [id], sequence: id === 'default' ? 1 : 0 });
  };

  changeFilter = (params) => {
    const { index, dispatch = () => {} } = this.props;

    if (params) {
      const { categoryids } = params;
      const categories = index.categories || [];

      // 获取处理之后的分类id
      const id = categoryids[0];
      const newCategoryIds = getSelectedCategoryIds(categories, id);

      const newFilter = { ...index.filter, ...params, categoryids: newCategoryIds };

      index.setFilter(newFilter);
    }

    dispatch('click-filter');

    this.setState({ visible: false });
  };

  // 上拉加载更多
  onRefresh = () => {
    const { dispatch = () => {} } = this.props;
    if (!this.props.index?.threads?.pageData?.length) return; // 防止第一页还没加载出来，用户使劲滚动页面到底部触发请求第二页
    return dispatch('moreData');
  };

  handleScroll = ({ scrollTop = 0 } = {}) => {
    const { height = 180 } = this.headerRef.current?.state || {};
    const { fixedTab } = this.state;
    // 只需要滚到临界点触发setState，而不是每一次滚动都触发
    if (!fixedTab && scrollTop >= height) {
      this.setState({ fixedTab: true });
    } else if (fixedTab && scrollTop < height) {
      this.setState({ fixedTab: false });
    }
  };

  renderTabs = () => {
    const { fixedTab } = this.state;
    const { categories = [], activeCategoryId, currentCategories } = this.props.index;

    return (
      <>
        {categories?.length > 0 && (
          <>
            <div ref={this.listRef} className={`${styles.homeContent} ${!this.enableVlist && fixedTab && styles.fixed}`}>
              <Tabs
                className={styles.tabsBox}
                scrollable
                type="primary"
                onActive={this.onClickTab}
                activeId={activeCategoryId}
                tabBarExtraContent={
                  <div onClick={this.searchClick} className={styles.tabIcon}>
                    <Icon name="SecondaryMenuOutlined" className={styles.buttonIcon} size={16} />
                  </div>
                }
              >
                {currentCategories?.map((item, index) => (
                  <Tabs.TabPanel key={index} id={item.pid} label={item.name} />
                ))}
              </Tabs>
            </div>
            {!this.enableVlist && fixedTab && <div className={styles.tabPlaceholder}></div>}
          </>
        )}
      </>
    );
  };

  renderHeaderContent = () => {
    const { sticks = [] } = this.props.index || {};

    return (
      <>
        {sticks?.length > 0 && (
          <div className={styles.homeContentTop}>
            <TopNew data={sticks} itemMargin="1" />
          </div>
        )}
      </>
    );
  };

  render() {
    const { index } = this.props;
    const { isFinished } = this.state;
    const { threads = {}, currentCategories, filter, threadError, sticks } = index;
    const { currentPage, totalPage, pageData } = threads || {};

    return (
      <BaseLayout
        showHeader={false}
        showTabBar
        onRefresh={this.onRefresh}
        noMore={currentPage >= totalPage}
        isFinished={isFinished}
        onScroll={this.handleScroll}
        quickScroll={true}
        curr="home"
        pageName="home"
        requestError={threadError.isError}
        errorText={threadError.errorText}
        onClickTabBar={this.onClickTabBar}
        disabledList={this.enableVlist}
      >
      <Fragment>
        <div className={classnames(styles.vTabs, 'text', this.state.fixedTab && styles.vFixed)}>
          {this.renderTabs()}
        </div>

        <this.DynamicVListLoading
          pageData={pageData}
          sticks={sticks}
          onScroll={this.handleScroll}
          loadNextPage={this.onRefresh}
          noMore={currentPage >= totalPage}
          requestError={threadError.isError}
          errorText={threadError.errorText}
          platform={'h5'}
        >
          <HomeHeader ref={this.headerRef} />
          <Observer>{() => this.renderTabs()}</Observer>
          <Observer>{() => this.renderHeaderContent()}</Observer>
        </this.DynamicVListLoading>
      </Fragment>

        <FilterView
          data={currentCategories}
          current={filter}
          onCancel={this.onClose}
          visible={this.state.visible}
          onSubmit={this.changeFilter}
        />
      </BaseLayout>
    );
  }
}

export default IndexH5Page;
