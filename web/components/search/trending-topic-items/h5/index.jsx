import React, { useCallback } from 'react';

import styles from './index.module.scss';

/**
 * 潮流话题
 * @prop {string[]} data 话题数据
 * @prop {function} onItemClick 话题点击事件
 */
const TrendingTopics = ({ data, onItemClick }) => {

  const click = (data) => {
    typeof onItemClick === 'function' && onItemClick(data);
  };

  return (
      <div className={styles.list}>
        {data?.map((item, index, arr) => (
            arr.length % 2 === 0 ?
                (<div key={index} className={`${styles.item} ${arr.length - index < 3 ? styles.footerItem : ''}`}
                      onClick={() => click(item)}>
                  <span className={`${styles.index} ${styles[`itemIndex${index + 1}`]}`}>{index + 1}</span>
                  <span className={styles.text}>{`#${item.content}#`}</span>
                </div>) :
                (<div key={index} className={`${styles.item} ${arr.length - index < 2 ? styles.footerItem : ''}`}
                      onClick={() => click(item)}>
                  <span className={`${styles.index} ${styles[`itemIndex${index + 1}`]}`}>{index + 1}</span>
                  <span className={styles.text}>{`#${item.content}#`}</span>
                </div>)

        ))}
      </div>
  );};

export default React.memo(TrendingTopics);
