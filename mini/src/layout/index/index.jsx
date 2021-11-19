import React, { createRef } from 'react';
import { inject, observer } from 'mobx-react';
import { View } from '@tarojs/components';
import ThreadContent from '../../components/thread';
import HomeHeader from '../../components/home-header';
import FilterView from './components/filter-view';
import BaseLayout from '../../components/base-layout';
import TopNew from './components/top-news';
import { getSelectedCategoryIds } from '@common/utils/handleCategory';
import Taro from '@tarojs/taro';
import { debounce } from '@common/utils/throttle-debounce.js';
import styles from './index.module.scss';
import IndexTabs from './components/tabs';
import ThreadList from '@components/virtual-list';
import PacketOpen from '@components/red-packet-animation';

import IndexHeaderHooks from '@common/plugin-hooks/plugin_index@header';
import IndexToppingHooks from '@common/plugin-hooks/plugin_index@topping';
import IndexTabsHook from '@common/plugin-hooks/plugin_index@tabs';

@inject('site')
@inject('user')
@inject('index')
@inject('thread')
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
      data:[
        {
          src:'https://imgcache.qq.com/operation/dianshi/other/banner.184c37ee8e1b9d10d85ca74f8e7f3b573b959f83.png',
          url:'https://developer.discuz.chat/#/',
        },
        {
          src:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwallcoo.com%2Fnature%2FSZ_178_Water_Air_and_Greenery%2Fimages%2FHJ069_350A.jpg&refer=http%3A%2F%2Fwallcoo.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1639893616&t=448d509e80495516558a3835b2bfaa51',
          url:'https://developer.discuz.chat/#/',
        },
        {
          src:'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Ffile02.16sucai.com%2Fd%2Ffile%2F2014%2F0829%2Fb871e1addf5f8e96f3b390ece2b2da0d.jpg&refer=http%3A%2F%2Ffile02.16sucai.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1639893616&t=f24d430dc49007ff8801f6d32b8a3272',
          url:'https://developer.discuz.chat/#/',
        }
      ]
    };
    this.tabsRef = createRef(null);
    this.headerRef = createRef(null);
    this.isNormal = false;
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000',
    });
  };
  componentDidMount() {
    // 是否有推荐
    const isDefault = this.props.site.checkSiteIsOpenDefautlThreadListData();
    this.props.index.setNeedDefault(isDefault);
  }

  // 点击更多弹出筛选
  searchClick = () => {
    this.props.index.setHiddenTabBar(true);

    this.setState({ visible: true });
  };
  // 关闭筛选框
  onClose = () => {
    this.props.index.setHiddenTabBar(false);

    this.setState({ visible: false });
  };

  onClickTab = (id = '') => {
    this.changeFilter({ categoryids: [id], sequence: id === 'default' ? 1 : 0 });
  };

  handleClickTabBar = (item, idx) => {
    if (item?.router === '/indexPages/home/index') {
      // 点击首页刷新
      this.changeFilter();
    }
  };
  changeFilter = (params) => {
    this.props.index.resetErrorInfo();
    this.setState({ isClickTab: true });

    this.props.baselayout.setJumpingToTop();
    this.props.index.setHiddenTabBar(false);

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

    this.debounceDispatch();

    this.setState({ visible: false });
  };

  debounceDispatch = debounce(() => {
    const { dispatch = () => {} } = this.props;
    dispatch('click-filter').then(() => {
      this.setState({ isClickTab: false });
    });
  }, 200);

  // 上拉加载更多
  onRefresh = () => {
    const { dispatch = () => {} } = this.props;
    return dispatch('moreData');
  };

  handleScrollToUpper = () => {
    this.tabsRef?.current?.changeFixedTab();
  };

  renderHeaderContent = () => {
    const { sticks = [] } = this.props.index || {};

    const component = (
      <>
        {sticks && sticks.length > 0 && (
          <View className={styles.homeContentTop}>
            <TopNew data={sticks} itemMargin="1" />
          </View>
        )}
      </>
    );

    return <IndexToppingHooks component={component} renderData={{ sticks }}></IndexToppingHooks>;
  };

  render() {
    const { index, user, thread } = this.props;
    const { hasRedPacket } = thread;

    const { isFinished, isClickTab } = this.state;
    const { threads = {}, TwoDThreads, currentCategories, filter, threadError } = index;
    const { currentPage = 1, totalPage, pageData } = threads || {};

    hasRedPacket && index.setHiddenTabBar(true);

    return (
      <BaseLayout
        showHeader={false}
        showTabBar
        onRefresh={this.onRefresh}
        noMore={!isClickTab && currentPage >= totalPage}
        isFinished={isFinished}
        onScroll={this.handleScroll}
        onScrollToUpper={this.handleScrollToUpper}
        curr="home"
        pageName="home"
        preload={3000}
        requestError={threadError.isError}
        errorText={threadError.errorText}
        onClickTabBar={this.handleClickTabBar}
      >
        {/* 顶部插件hooks */}
        <IndexHeaderHooks site={this.props.site} component={<HomeHeader />}></IndexHeaderHooks>

        <IndexTabsHook
          component={<IndexTabs onClickTab={this.onClickTab} searchClick={this.searchClick} ref={this.tabsRef} />}
          changeFilter={(params) => this.changeFilter(params)}
          renderData={{
            categories: index.categories,
          }}
        ></IndexTabsHook>

        <View style={{ display: isClickTab ? 'none' : 'block' }}>
          {this.renderHeaderContent()}

          <View>
            {this.state.data && <centerAds data={this.state.data}/>}
          </View>
          
          {!this.isNormal ? (
            <ThreadList data={TwoDThreads} isClickTab={isClickTab} wholePageIndex={currentPage - 1} />
          ) : (
            pageData?.map((item, index) => (
              <ThreadContent
                key={`${item.threadId}-${item.updatedAt}-${item._time}`}
                showBottomStyle={index !== pageData.length - 1}
                data={item}
                className={styles.listItem}
                enableCommentList={true}
              />
            ))
          )}
        </View>


        
        <FilterView
          data={currentCategories}
          typelist={this.props.index.threadTypelist}
          current={filter}
          onCancel={this.onClose}
          visible={this.state.visible}
          onSubmit={this.changeFilter}
          permissions={user.threadExtendPermissions}
        />
        {hasRedPacket > 0 && (
          <PacketOpen
            money={hasRedPacket}
            onClose={() => {
              thread.setRedPacket(0);
              index.setHiddenTabBar(false);
            }}
          />
        )}
      </BaseLayout>
    );
  }
}

export default IndexH5Page;
