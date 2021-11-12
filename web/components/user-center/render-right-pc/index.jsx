import React, { useState, Fragment } from 'react';
import styles from './index.module.scss';
import UserCenterFansPc from '@components/user-center/fans-pc';
import UserCenterFollowsPc from '@components/user-center/follows-pc';
import MemberShipCard from '@components/member-ship-card';
import SidebarPanel from '@components/sidebar-panel';
import Avatar from '@components/avatar';
import Router from '@discuzq/sdk/dist/router';
import Copyright from '@components/copyright';
import RenewalFee from '@components/user-center/renewal-fee';

function RenderRightPC(props) {
  const { user, site } = props;
  const [isRenewalFeeVisible, setIsRenewalFeeVisible] = useState(false);

  // 是否显示续费卡片
  const whetherIsShowRenewalCard = () => !user?.isAdmini;

  // 点击续费弹窗
  const onRenewalFeeClick = () => {
    setIsRenewalFeeVisible(true);
  };

  // 关闭续费弹窗
  const onRenewalFeeClose = () => {
    setIsRenewalFeeVisible(false);
  };

  // 条件都满足时才显示微信
  const IS_WECHAT_ACCESSABLE = site.wechatEnv !== 'none' && !!user.wxNickname;

  return (
      <Fragment>
      {whetherIsShowRenewalCard() && (
        <MemberShipCard
          shipCardClassName={styles.MemberShipCardWrapperPc}
          onRenewalFeeClick={onRenewalFeeClick}
        />
      )}
      <SidebarPanel
        platform="h5"
        type="normal"
        title="个人资料"
        isShowMore={true}
        noData={false}
        moreText={'编辑资料'}
        onShowMore={() => {
          Router.push({ url: '/my/edit' });
        }}
        className={`${styles.borderRadius}`}
      >
        {site?.isSmsOpen && (
          <div className={styles.userInfoWrapper}>
            <div className={styles.userInfoKey}>手机号码</div>
            <div className={styles.userInfoValue}>{user.mobile || '未绑定'}</div>
          </div>
        )}

        {IS_WECHAT_ACCESSABLE && (
          <div className={styles.userInfoWrapper}>
            <div className={styles.userInfoKey}>微信</div>
            <div className={`${styles.userInfoValue} ${styles.wxContent}`}>
              <Avatar size="small" image={user.wxHeadImgUrl} name={user.wxNickname} />
              <span className={styles.wecahtNickname}>{user.wxNickname}</span>
            </div>
          </div>
        )}

        <div className={styles.userInfoWrapper}>
          <div className={styles.userInfoKey}>签名</div>
          <div className={styles.userInfoValue}>{user.signature || '这个人很懒，什么也没留下~'}</div>
        </div>
      </SidebarPanel>

      <UserCenterFansPc userId={user.id} />

      <UserCenterFollowsPc userId={user.id} />
      <Copyright />
      <RenewalFee visible={isRenewalFeeVisible} onClose={onRenewalFeeClose} />
    </Fragment>
  );
}

export default RenderRightPC;
