import React, { useCallback } from 'react';
import Avatar from '@components/avatar';

import styles from './index.module.scss';

/**
 * 活跃用户
 * @prop {{id:string, image:string, name: string}[]} data 用户数据
 * @prop {function} onItemClick 用户点击事件
 */
const ActiveUsers = ({ direction = 'right', data, onItemClick }) => {

  const click = useCallback((data) => {
    typeof onItemClick === 'function' && onItemClick(data);
  }, [data]);

  return (
    <div className={styles.list}>
      {data?.map((item, index) => (
        // <User direction={direction} key={index} data={item} onClick={onItemClick} />
        <div key={index} className={styles.item} onClick={() => click(item)}>
          <div className={styles.avatar}>
            <Avatar direction={direction} image={item.avatar} name={item.nickname} isShowUserInfo userId={item.userId} />
          </div>
          <div className={styles.content}>
            <div className={styles.name}>{item.nickname || ''}</div>
            <div className={styles.groupName}>{item.groupName || ''}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// /**
//  * 用户组件
//  * @prop {object} data 用户数据
//  * @prop {function} onClick 用户点击事件
//  */
// const User = ({ direction = 'right', data, onClick }) => {
//   const click = useCallback(() => {
//     onClick && onClick(data);
//   }, [data, onClick]);
//   return (
//     <div className={styles.item} onClick={click}>
//       <div className={styles.avatar}>
//         <Avatar direction={direction} image={data.avatar} name={data.nickname} isShowUserInfo userId={data.userId} />
//       </div>
//       <div className={styles.content}>
//         <div className={styles.name}>{data.nickname || ''}</div>
//         <div className={styles.groupName}>{data.groupName || ''}</div>
//       </div>
//     </div>
//   );
// };

export default React.memo(ActiveUsers);
