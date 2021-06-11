import React from 'react';
import UserCenterEditAccountPwd from '../../../../components/user-center-edit-account-pwd';
import HOCUserInfo from '@middleware/HOCUserInfo';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import ViewAdapter from '@components/view-adapter';
import { inject, observer } from 'mobx-react';

@inject('site')
@observer
class EditPwdPage extends React.Component {
  render() {
    return <ViewAdapter 
    h5={(
      <div>
        <UserCenterEditAccountPwd />
      </div>
    )}
    pc={null}
    title={`设置密码 - ${this.props.site?.siteName}`}
  />
  }
}

export default HOCFetchSiteData(HOCUserInfo(EditPwdPage));
