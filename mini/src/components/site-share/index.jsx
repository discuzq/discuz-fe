import React from 'react'
import Taro from '@tarojs/taro'
import {ActionSheet} from '@discuzq/design'

const Index = ({ show, onShareClose, site }) => {
    const shareData = {
        title: site.webConfig?.setSite?.siteName || '',
        path: 'pages/index/index',
    };
    const createCard = () => {
        const data = {...site, }
        onShareClose()
        Taro.eventCenter.once('page:init', () => {
            Taro.eventCenter.trigger('message:detail', data)
        })
        Taro.navigateTo({
            url: `/subPages/create-card/index`,
        })
    }
    const actions = [
        {
            icon: 'PictureOutlinedBig',
            description: '生成海报'
        },
        {
            icon: 'WeChatOutlined',
            description: '微信分享',
            canShare: true,
            shareData,
        }
    ]
    const onSelect = (e, item) => {
        switch(item.description) {
            case '生成海报': createCard(); break;
            case '微信分享': onShareClose(); break;
        }
    }
    return (
        <ActionSheet
            actions={actions}
            visible={show}
            onClose={onShareClose}
            layout='row'
            onSelect={onSelect}
            buttonStyle={{ fontSize: 14 }}
        >
        </ActionSheet>
    //   <Popup
    //     position="bottom"
    //     visible={show}
    //     onClose={onShareClose}>
    //     <View className={styles.body}>
    //         <View className={styles.container}>
    //             <View className={classNames(styles.more, styles.oneRow)}>
    //                 <View className={styles.moreItem} onClick={CreateCard}>
    //                     <View className={styles.icon}>
    //                         <Icon name='PictureOutlinedBig' size={20}>
    //                         </Icon>
    //                     </View>
    //                     <Text className={styles.text}>
    //                         生成海报
    //                     </Text>
    //                 </View>
    //                 <Button className={styles.moreItem} openType='share' plain='true' data-shareData={shareData} onClick={onShareClose}>
    //                     <View className={styles.icon}>
    //                         <Icon name='WeChatOutlined' size={20}>
    //                         </Icon>
    //                     </View>
    //                     <Text className={styles.text}>
    //                         微信分享
    //                     </Text>
    //                 </Button>
    //             </View>
    //         </View>
    //         <View className={styles.button} >
    //             <Text className={styles.cancel} onClick={onShareClose}>
    //                 取消
    //             </Text>
    //         </View>
    //     </View>
    //   </Popup>
    )
}

export default React.memo(Index)
