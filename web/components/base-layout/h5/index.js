import React,  { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from '@components/header';
import List from '@components/list'
import BottomNavBar from '@components/bottom-nav-bar'
import { PullDownRefresh } from "@discuzq/design"

import styles from './index.module.scss';

/**
* PC端集成布局组件
* @prop {function} header 头部视图组件
* @prop {function} children 内容区域中间视图组件
* @prop other List Props // List组件所有的属性
* @example 
*     <BaseLayout>
        {(props) => <div>中间</div>}
      </BaseLayout>
*/

const BaseLayout = (props) => {
  const { showHeader = true, showTabBar = false, showPullDown = false, children = null, onPullDown, refresh = true } = props;

  const debounce = (fn, wait) => {
    let timer = null;
    return () => {
      if(timer !== null){
        clearTimeout(timer);
      }
      timer = setTimeout(fn, wait);
    }
  }


  return (
    <div className={styles.container}>
        {showHeader && <Header />}
        {
          showPullDown ? (
            <PullDownRefresh onRefresh={onPullDown} isFinished={refresh} height={750}>
                <List {...props} className={styles.list}>
                    {typeof(children) === 'function' ? children({ ...props }) : children}
                </List>
            </PullDownRefresh>
          ) : (
            <List {...props} className={styles.list}>
                {typeof(children) === 'function' ? children({ ...props }) : children}
            </List>
          )
        }
        
        {showTabBar && <BottomNavBar placeholder />}
    </div>
  );
};

export default BaseLayout;