import React, { useEffect, useState, useMemo } from 'react';
import { ActionSheet } from '@discuzq/design'
import styles from './index.module.scss';

const InputPop = (props) => {
  const { visible, onSubmit, onClose, onOperClick, permissions = {}, statuses = {}, shareData, isShowShare } = props;

  const { canEdit, canDelete, canEssence, canStick, canShare, canCollect, isAdmini } = permissions;
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
  const actions = []
  if (canEdit && !isShowShare) {
    actions.push({
      icon: 'RedactOutlined',
      description: '编辑',
    });
  }
  if (canDelete && !isShowShare) {
    actions.push({
      icon: 'DeleteOutlined',
      description: '删除',
    });
  }
  if (canEssence && !isShowShare) {
    actions.push({
      icon: 'HotBigOutlined',
      description: '精华',
      className: essence ? styles.actived : '',
    });
  }
  if (canStick && !isShowShare) {
    actions.push({
      icon: 'TopOutlined',
      description: '置顶',
      className: stick ? styles.actived : '',
    });
  }
  if (canCollect && !isShowShare) {
    actions.push({
      icon: 'CollectFunOutlined',
      description: '收藏',
      className: collect ? styles.actived : '',
    });
  }
  if (canShare && !isShowShare) {
    actions.push({
      icon: 'PictureOutlinedBig',
      description: '生成海报',
    }, {
      icon: 'WeChatOutlined',
      description: '微信分享',
      canShare: true,
      shareData,
    });
  }
  if (!isAdmini && !isShowShare) {
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
      case '生成海报': onOperClick('posterShare'); break;
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
    // <Popup position="bottom" visible={visible} onClose={onClose} customScroll={true}>
    //   <View className={styles.body}>
    //     <View className={styles.container}>
    //       <View className={className(styles.more, buttonNumber < 5 && styles.flex)}>
    //         {canEdit && !isShowShare && (
    //           <View className={styles.moreItem} onClick={() => onOperClick('edit')}>
    //             <View className={styles.icon}>
    //               <Icon name="RedactOutlined" size={20}></Icon>
    //             </View>
    //             <View className={styles.text}>编辑</View>
    //           </View>
    //         )}
    //         {canDelete && !isShowShare && (
    //           <View className={styles.moreItem} onClick={() => onOperClick('delete')}>
    //             <View className={styles.icon}>
    //               <Icon name="DeleteOutlined" size={20}></Icon>
    //             </View>
    //             <View className={styles.text}>删除</View>
    //           </View>
    //         )}
    //         {canEssence && !isShowShare && (
    //           <View
    //             className={className(styles.moreItem, essence && styles.actived)}
    //             onClick={() => onOperClick('essence')}
    //           >
    //             <View className={styles.icon}>
    //               <Icon name="HotBigOutlined" size={20}></Icon>
    //             </View>
    //             <View className={styles.text}>精华</View>
    //           </View>
    //         )}
    //         {canStick && !isShowShare && (
    //           <View
    //             className={className(styles.moreItem, stick && styles.actived)}
    //             onClick={() => onOperClick('stick')}
    //           >
    //             <View className={styles.icon}>
    //               <Icon name="TopOutlined" size={20}></Icon>
    //             </View>
    //             <View className={styles.text}>置顶</View>
    //           </View>
    //         )}
    //         {canCollect && !isShowShare && (
    //           <View
    //             className={className(styles.moreItem, collect && styles.actived)}
    //             onClick={() => onOperClick('collect')}
    //           >
    //             <View className={styles.icon}>
    //               <Icon name="CollectFunOutlined" size={20}></Icon>
    //             </View>
    //             <View className={styles.text}>收藏</View>
    //           </View>
    //         )}
    //         {/* TODO:生成海报 */}
    //         {canShare && isShowShare && (
    //           <View className={styles.moreItem} onClick={() => onOperClick('posterShare')}>
    //             <View className={styles.icon}>
    //               <Icon name="PictureOutlinedBig" size={20}></Icon>
    //             </View>
    //             <View className={styles.text}>生成海报</View>
    //           </View>
    //         )}
    //         {/* TODO:微信分享 */}
    //         {canShare && isShowShare && (
    //           <View className={styles.moreItem}>
    //             <Button
    //               className={className(styles.icon)}
    //               openType="share"
    //               data-shareData={shareData}
    //               onClick={() => onOperClick('wxShare')}
    //             >
    //               <Icon className={styles.icon} size="20" name="WeChatOutlined"></Icon>
    //             </Button>
    //             <View className={styles.text}>微信分享</View>
    //           </View>
    //         )}
    //         {!isShowShare && !isAdmini && (
    //           <View className={styles.moreItem} onClick={() => onOperClick('report')}>
    //             <View className={styles.icon}>
    //               <Icon name="WarnOutlined" size={20}></Icon>
    //             </View>
    //             <View className={styles.text}>举报</View>
    //           </View>
    //         )}
    //       </View>
    //     </View>

    //     <View className={styles.button}>
    //       <Button full={true} onClick={onSubmit} className={styles.cancel} type="default">
    //         取消
    //       </Button>
    //     </View>
    //   </View>
    // </Popup>
  );
};

export default InputPop;
