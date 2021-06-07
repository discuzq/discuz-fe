import React,  { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { Flex } from '@discuzq/design';
import Header from '@components/header';
import List from '@components/list';
import RefreshView from '@components/list/RefreshView';
import ErrorView from '@components/list/ErrorView';
import { noop } from '@components/thread/utils';

import styles from './index.module.scss';
/**
* PC端集成布局组件
* @prop {function} header 头部视图组件
* @prop {function} left 内容区域左部视图组件
* @prop {function} children 内容区域中间视图组件
* @prop {function} right 内容区域右部视图组件
* @prop {function} footer 底部视图组件
* @prop other List Props // List组件所有的属性
* @example
*     <BaseLayout
        left={(props) => <div>左边</div>}
        right={(props) => <div>右边</div>}
      >
        {(props) => <div>中间</div>}
      </BaseLayout>
*/

const baseLayoutWhiteList = ['home', 'search'];

const BaseLayout = forwardRef((props, ref) => {
  const {
    header = null,
    left = null,
    children = null,
    right = null,
    footer = null,
    onSearch,
    noMore = false,
    onRefresh,
    pageName = '',
    onScroll = noop,
    immediateCheck=false,
    requestError=false,
    errorText='加载失败',
    rightClass = '',
    isShowLayoutRefresh = true
  } = props;

  const listRef = useRef(null);
  const [isError, setIsError] = useState(false);

  const debounce = (fn, wait) => {
    let timer = null;
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(fn, wait);
    };
  };

  useImperativeHandle(
    ref,
    () => ({
      listRef,
    }),
  );

  useEffect(() => {
    setIsError(requestError);
  }, [requestError])

  // const updateSize = debounce(() => {
  //   if (window) {
  //     const current = window.innerWidth;
  //     console.log(current);
  //   }
  // }, 50);

  useEffect(() => {
    // if (window) {
    //   window.addEventListener('resize', updateSize);
    //   return () => {
    //       window.removeEventListener('resize', updateSize);
    //   };
    // }
  }, []);

  // list组件，接口请求出错回调
  const onError = () => {
    setIsError(true);
  };

  let cls = styles['col-1'];
  if (left || right) {
    cls = styles['col-2'];
  }
  if (left && right) {
    cls = styles['col-3'];
  }
  console.log(isError, errorText);
  return (
    <div className={styles.container}>
        {(header && header({ ...props })) || <Header onSearch={onSearch} />}



        <div className={`${styles.body} ${cls}`}>


          <List {...props} immediateCheck={immediateCheck} className={styles.list} wrapperClass={styles.wrapper} ref={listRef} onError={onError} onScroll={onScroll}>
            {
              (pageName === 'home' || left) && (
                <div className={styles.left}>
                  {typeof(left) === 'function' ? useCallback(left({ ...props }), []) : left}
                </div>
              )
            }

            <div className={styles.center}>
              {typeof(children) === 'function' ? children({ ...props }) : children}
              {!isError && isShowLayoutRefresh && onRefresh && <RefreshView noMore={noMore} />}
              {isError && <ErrorView text={errorText} />}
            </div>

            {
              (pageName === 'home' || right) && (
                <div className={`${styles.right} ${(pageName === "home") ? styles["home-right"] : ""}`}>
                  {typeof(right) === 'function' ? right({ ...props }) : right}
                </div>
              )
            }
          </List>

        </div>
        

      {typeof(footer) === 'function' ? footer({ ...props }) : footer}
    </div>
  );
});

export default BaseLayout;
