import React from 'react';
import styles from './index.module.scss';
import classnames from 'classnames';
import { IMG_SRC_HOST } from '@common/constants/site';
import { View, Text, Image } from '@tarojs/components';

// 部署后替换为线上链接
import badgeImg_1 from '../../../../web/public/dzq-img/member-badge_1.png';
import badgeImg_2 from '../../../../web/public/dzq-img/member-badge_2.png';
import badgeImg_3 from '../../../../web/public/dzq-img/member-badge_3.png';
import badgeImg_4 from '../../../../web/public/dzq-img/member-badge_4.png';
import badgeImg_5 from '../../../../web/public/dzq-img/member-badge_5.png';
export default class MemberBadge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  getMemberBadgeIcon() {
    const { groupLevel } = this.props;
    switch (groupLevel) {
      case 1:
        return badgeImg_1;
      case 2:
        return badgeImg_2;
      case 3:
        return badgeImg_3;
      case 4:
        return badgeImg_4;
      case 5:
        return badgeImg_5;
    }

    // return `${IMG_SRC_HOST}/assets/member-badge_${groupLevel}.png`
  }

  render() {
    const { groupLevel, groupName, hasBg, groupNameStyle, memberBadgeStyle } = this.props;

    return (
      <View className={classnames(styles.memberBadgeBox, hasBg ? styles.bg : styles.default)} style={memberBadgeStyle}>
        <Image className={styles.memberBadgeIcon} src={this.getMemberBadgeIcon()} />
        <View className={classnames(styles.memberBadgeName, styles['memberBadgeName_' + groupLevel])}>
          <Text className={styles.memberBadgeNameText} style={groupNameStyle}>
            {groupName}
          </Text>
        </View>
      </View>
    );
  }
}
