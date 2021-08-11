import React from 'react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import FilterRichText from '@components/filter-rich-text'
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
/**
 * 置顶消息
 * @prop {{prefix:string, title:string}[]} data
 */
const TopNews = ({ data = [], router, platform = 'h5'}) => {
  const onClick = ({ threadId } = {}, e) => {
    if (e?.target?.localName === 'a') {
      return
    }
    router.push(`/thread/${threadId}`);
  };

  const handlerTitle = (title = '') => {
    if (platform = 'h5' && title.length > 20) {
      return `${title.slice(0, 20)}...`
    }
    return title
  }

  return (
    <div className={`${styles.list} top-news`}>
      {data?.map((item, index) => (
        <div
          key={index}
          className={`top-news-item ${styles.item} ${platform === 'pc' ? styles.itemPC : styles.itemH5}`}
          onClick={() => onClick(item)}
        >
          <div className={styles.prefix}>{item.prefix || '置顶'}</div>
          {false && <div className={styles.title}>{handlerTitle(item.title)}</div>}
          <div className={styles.title}>
            <FilterRichText 
              onClick={(e) => onClick(item, e)} className={styles.richText} content={item.title}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default withRouter(TopNews);
