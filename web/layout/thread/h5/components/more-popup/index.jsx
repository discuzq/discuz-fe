import React, { useEffect, useMemo, useState } from 'react';
import { ActionSheet } from '@discuzq/design';
import styles from './index.module.scss';
import className from 'classnames';
import classNames from 'classnames';
const InputPop = (props) => {
  const { visible, onSubmit, onClose, onOperClick, permissions = {}, statuses = {} } = props;

  const { canEdit, canDelete, canEssence, canStick, canShare, canWxShare, canCollect, isAdmini } = permissions;
  const { isEssence, isStick, isCollect } = statuses;

  const [essence, setEssence] = useState(isEssence);
  const [stick, setStick] = useState(isStick);
  const [collect, setCollect] = useState(isCollect);

  useEffect(() => {
    setEssence(isEssence);
  }, [isEssence]);

  useEffect(() => {
    setStick(isStick);
  }, [isStick]);

  useEffect(() => {
    setCollect(isCollect);
  }, [isCollect]);
  const actions = [];
  if (canEdit) {
    actions.push({
      icon: 'RedactOutlined',
      description: '编辑',
    });
  }
  if (canDelete) {
    actions.push({
      icon: 'DeleteOutlined',
      description: '删除',
    });
  }
  if (canEssence) {
    actions.push({
      icon: 'HotBigOutlined',
      description: '精华',
      className: essence ? styles.actived : '',
    });
  }
  if (canStick) {
    actions.push({
      icon: 'TopOutlined',
      description: '置顶',
      className: stick ? styles.actived : '',
    });
  }
  if (canCollect) {
    actions.push({
      icon: 'CollectFunOutlined',
      description: '收藏',
      className: collect ? styles.actived : '',
    });
  }
  if (canShare) {
    actions.push({
      icon: 'PictureOutlinedBig',
      description: '生成海报',
    }, {
      icon: 'PaperClipOutlined',
      description: '复制链接',
    });
  }
  if (canWxShare) {
    actions.push({
      icon: 'WeChatOutlined',
      description: '微信分享',
    });
  }
  if (!isAdmini) {
    actions.push({
      icon: 'WarnOutlined',
      description: '举报',
    });
  }
  const onSelect = (e, item) => {
    switch (item.description) {
      case '编辑': onOperClick('edit'); break;
      case '删除': onOperClick('delete'); break;
      case '精华': onOperClick('essence'); break;
      case '置顶': onOperClick('stick'); break;
      case '收藏': onOperClick('collect'); break;
      case '生成海报': onOperClick('post'); break;
      case '复制链接': onOperClick('copylink'); break;
      case '微信分享': onOperClick('wxshare'); break;
      case '举报': onOperClick('report'); break;
    }
  };
  return (
    <ActionSheet
      actions={actions}
      layout='row'
      visible={visible}
      onClose={onClose}
      buttonStyle={{ fontSize: 14 }}
      onSelect={onSelect}
      onCancel={onSubmit}
    >
    </ActionSheet>
    // <Popup position="bottom" visible={visible} onClose={onClose}>
    //   <div>
    //     <div className={styles.container}>
    //       <div className={classNames(styles.more, buttonNumber < 5 && styles.flex)}>
    //         {canEdit && (
    //           <div className={styles.moreItem} onClick={() => onOperClick('edit')}>
    //             <div className={styles.icon}>
    //               <Icon name="RedactOutlined" size={20}></Icon>
    //             </div>
    //             <div className={styles.text}>编辑</div>
    //           </div>
    //         )}
    //         {canDelete && (
    //           <div className={styles.moreItem} onClick={() => onOperClick('delete')}>
    //             <div className={styles.icon}>
    //               <Icon name="DeleteOutlined" size={20}></Icon>
    //             </div>
    //             <div className={styles.text}>删除</div>
    //           </div>
    //         )}
    //         {canEssence && (
    //           <div
    //             className={className(styles.moreItem, essence && styles.actived)}
    //             onClick={() => onOperClick('essence')}
    //           >
    //             <div className={styles.icon}>
    //               <Icon name="HotBigOutlined" size={20}></Icon>
    //             </div>
    //             <div className={styles.text}>精华</div>
    //           </div>
    //         )}
    //         {canStick && (
    //           <div className={className(styles.moreItem, stick && styles.actived)} onClick={() => onOperClick('stick')}>
    //             <div className={styles.icon}>
    //               <Icon name="TopOutlined" size={20}></Icon>
    //             </div>
    //             <div className={styles.text}>置顶</div>
    //           </div>
    //         )}
    //         {canCollect && (
    //           <div
    //             className={className(styles.moreItem, collect && styles.actived)}
    //             onClick={() => onOperClick('collect')}
    //           >
    //             <div className={styles.icon}>
    //               <Icon name="CollectFunOutlined" size={20}></Icon>
    //             </div>
    //             <div className={styles.text}>收藏</div>
    //           </div>
    //         )}
    //         {canShare && (
    //           <div className={styles.moreItem} onClick={() => onOperClick('post')}>
    //             <div className={styles.icon}>
    //               <Icon name="PictureOutlinedBig" size={20}></Icon>
    //             </div>
    //             <div className={styles.text}>生成海报</div>
    //           </div>
    //         )}
    //         {canShare && (
    //           <div className={styles.moreItem} onClick={() => onOperClick('copylink')}>
    //             <div className={styles.icon}>
    //               <Icon name="PaperClipOutlined" size={20}></Icon>
    //             </div>
    //             <div className={styles.text}>复制链接</div>
    //           </div>
    //         )}
    //         {canWxShare && (
    //           <div className={styles.moreItem} onClick={() => onOperClick('wxshare')}>
    //             <div className={styles.icon}>
    //               <Icon name="WeChatOutlined" size={20}></Icon>
    //             </div>
    //             <div className={styles.text}>微信分享</div>
    //           </div>
    //         )}
    //         {!isAdmini && (
    //           <div className={styles.moreItem} onClick={() => onOperClick('report')}>
    //             <div className={styles.icon}>
    //               <Icon name="WarnOutlined" size={20}></Icon>
    //             </div>
    //             <div className={styles.text}>举报</div>
    //           </div>
    //         )}
    //       </div>
    //     </div>

  //     <div className={styles.button}>
  //       <Button full={true} onClick={onSubmit} className={styles.cancel} type="default">
  //         取消
  //       </Button>
  //     </div>
  //   </div>
  // </Popup>
  );
};

export default InputPop;
