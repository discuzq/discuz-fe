import React from 'react';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import FilterRichText from '@components/filter-rich-text'
import { handleLink } from '@components/thread/utils'
import Router from '@discuzq/sdk/dist/router';
/**
 * 置顶消息
 * @prop {{prefix:string, title:string}[]} data
 */
 const TopNews = ({ data = [], router, platform = 'h5'}) => {
  const onClick = ({ threadId } = {}, e, node) => {
    e && e.stopPropagation();
    const {url, isExternaLink } = handleLink(node)
    if(isExternaLink) return

    if (url) {
      Router.push({url})
    } else {
      Router.push({url: `/indexPages/thread/index?id=${threadId}`});
    }
  };

  const handlerTitle = (title = '') => {
    if (platform = 'h5' && title.length > 20) {
      return `${title.slice(0, 20)}...`
    }
    return title
  }

  return (
    <View className={styles.list}>
      {data?.map((item, index) => (
        <View
          key={index}
          className={`${styles.item} ${styles.itemH5}`}
          onClick={() => onClick(item)}
        >
          <Text className={styles.prefix}>{item.prefix || '置顶'}</Text>
          {false && <View className={styles.title}>{handlerTitle(item.title)}</View>}
          <View className={styles.title}>
            <FilterRichText 
              onClick={(e, node) => onClick(item, e, node)} className={styles.richText} content={item.title} 
            />
          </View>
        </View>
      ))}
    </View>
  );
};

export default TopNews;
