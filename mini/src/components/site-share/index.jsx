import React from 'react'
import { View, Button, Text } from '@tarojs/components'
import styles from './index.module.scss'
import Icon from '@discuzq/design/dist/components/icon/index';
import Taro from '@tarojs/taro'
import classNames from 'classnames';
import Popup from '@discuzq/design/dist/components/popup/index';
import setUrlParam from '@common/utils/set-url-param';

const Index = ({ show, onShareClose, site, customShareData, inviteCode = '', type }) => {
    const shareData = {
        title: customShareData?.title || site.webConfig?.setSite?.siteName || '',
        path: setUrlParam(customShareData?.path  || 'pages/index/index', { inviteCode }),
    };
    const CreateCard = () => {
        const data = {...site, }
        onShareClose()
        Taro.eventCenter.once('page:init', () => {
            Taro.eventCenter.trigger('message:detail', data)
            type === 'invite' && Taro.eventCenter.trigger('message:invite', customShareData);
        })
        Taro.navigateTo({
            url: `/subPages/create-card/index`,
        })
    }
    return (
      <Popup
        position="bottom"
        visible={show}
        onClose={onShareClose}>
        <View className={styles.body}>
            <View className={styles.container}>
                <View className={classNames(styles.more, styles.oneRow)}>
                    <View className={styles.moreItem} onClick={CreateCard}>
                        <View className={styles.icon}>
                            <Icon name='PictureOutlinedBig' size={20}>
                            </Icon>
                        </View>
                        <Text className={styles.text}>
                            生成海报
                        </Text>
                    </View>
                    <Button className={styles.moreItem} openType='share' plain='true' data-shareData={shareData} onClick={onShareClose}>
                        <View className={styles.icon}>
                            <Icon name='WeChatOutlined' size={20}>
                            </Icon>
                        </View>
                        <Text className={styles.text}>
                            微信分享
                        </Text>
                    </Button>
                </View>
            </View>
            <View className={styles.button} >
                <Text className={styles.cancel} onClick={onShareClose}>
                    取消
                </Text>
            </View>
        </View>
      </Popup>
    )
}

export default React.memo(Index)
