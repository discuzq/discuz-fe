import React, { createRef } from 'react';
import { inject, observer } from 'mobx-react';
import { View } from '@tarojs/components'
import ThreadContent from '../../components/thread';
import HomeHeader from '../../components/home-header';
import FilterView from './components/filter-view';
import BaseLayout from '../../components/base-layout';
import TopNew from './components/top-news';
import { getSelectedCategoryIds } from '@common/utils/handleCategory';
import Taro from '@tarojs/taro';
import { debounce } from '@common/utils/throttle-debounce.js';
import styles from './index.module.scss';
import IndexTabs from './components/tabs'
import ThreadList from '@components/virtual-list'

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
      filter: {},
      currentIndex: 'all',
      isFinished: true,
      isClickTab: false,
      windowHeight: 0,
    };
    this.tabsRef = createRef(null);
    this.headerRef = createRef(null);
    this.isNormal = false
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000'
    })
  }
  componentDidMount() {
    // 是否有推荐
    const isDefault = this.props.site.checkSiteIsOpenDefautlThreadListData();
    this.props.index.setNeedDefault(isDefault);
  }

  // 点击更多弹出筛选
  searchClick = () => {
    this.props.index.setHiddenTabBar(true)

    this.setState({ visible: true });
  };
  // 关闭筛选框
  onClose = () => {
    this.props.index.setHiddenTabBar(false)

    this.setState({ visible: false });
  };

  onClickTab = (id = '') => {
    this.changeFilter({ categoryids: [id], sequence: id === 'default' ? 1 : 0 })
  };

  handleClickTabBar = (item, idx) => {
    if(item?.router === "/indexPages/home/index") { // 点击首页刷新
      this.changeFilter()
    }
  }
  changeFilter = (params) => {
    this.props.index.resetErrorInfo()
    this.setState({ isClickTab: true })

    this.props.baselayout.setJumpingToTop();
    this.props.index.setHiddenTabBar(false)

    const { index, dispatch = () => {} } = this.props

    if (params) {
      const { categoryids } = params
      const categories = index.categories || [];

      // 获取处理之后的分类id
      const id = categoryids[0]
      const newCategoryIds = getSelectedCategoryIds(categories, id)

      const newFilter = { ...index.filter, ...params, categoryids: newCategoryIds };

      index.setFilter(newFilter);
    }

    this.debounceDispatch()

    this.setState({ visible: false })
  }

  debounceDispatch = debounce(() => {
    const { dispatch = () => {} } = this.props
    dispatch('click-filter').then(() => {
      this.setState({ isClickTab: false });
    });
  }, 200)

  // 上拉加载更多
  onRefresh = () => {
    const { dispatch = () => {} } = this.props;
    return dispatch('moreData');
  };

  handleScrollToUpper = () => {
    this.tabsRef?.current?.changeFixedTab()
  }

  renderHeaderContent = () => {
    const { sticks = [] } = this.props.index || {};

    return (
      <>
        {sticks && sticks.length > 0 && (
          <View className={styles.homeContentTop}>
            <TopNew data={sticks} itemMargin="1" />
          </View>
        )}
      </>
    );
  };

  render() {
    const { index, user } = this.props;
    const { isFinished, isClickTab } = this.state;
    const { threads = {}, currentCategories, filter, threadError } = index;
    const { currentPage = 1, totalPage, pageData } = threads || {};
    return (
      <BaseLayout
        showHeader={false}
        showTabBar
        onRefresh={this.onRefresh}
        noMore={!isClickTab && currentPage >= totalPage}
        isFinished={isFinished}
        onScroll={this.handleScroll}
        onScrollToUpper={this.handleScrollToUpper}
        curr='home'
        pageName='home'
        preload={3000}
        requestError={threadError.isError}
        errorText={threadError.errorText}
        onClickTabBar={this.handleClickTabBar}
      >
        <HomeHeader />

        <IndexTabs onClickTab={this.onClickTab} searchClick={this.searchClick} ref={this.tabsRef} />

        <View style={{display: isClickTab ? 'none' : 'block'}}>
          {this.renderHeaderContent()}

          {
            !this.isNormal ? (
              <ThreadList data={pageData} isClickTab={isClickTab} wholePageIndex={currentPage - 1}/>
            ) : (
              pageData?.map((item, index) => (
                <ThreadContent
                  key={`${item.threadId}-${item.updatedAt}`}
                  showBottomStyle={index !== pageData.length - 1}
                  data={item}
                  className={styles.listItem}
                />
              ))
            )
          }
        </View>

        <FilterView
          data={currentCategories}
          current={filter}
          onCancel={this.onClose}
          visible={this.state.visible}
          onSubmit={this.changeFilter}
          permissions={user.threadExtendPermissions}
        />
      </BaseLayout>
    );
  }
}

export default IndexH5Page;
