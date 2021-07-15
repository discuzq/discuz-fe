import React from 'react';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import RichText from '@discuzq/design/dist/components/rich-text/index';
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

  // 过滤内容
  const filterContent = (content) => {
    let newContent = content ? s9e.parse(content) : '暂无内容';
    newContent = xss(newContent);

    return newContent;
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
              <RichText onClick={(e, node) => onClick(item, e, node)} className={styles.richText} content={filterContent(item.title)} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default TopNews;
