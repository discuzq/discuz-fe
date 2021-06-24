import React from 'react';
import UserCenterEditUserName from '../../../../components/user-center-edit-username/index';
import HOCUserInfo from '@middleware/HOCUserInfo';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import ViewAdapter from '@components/view-adapter';
import { inject, observer } from 'mobx-react';

@inject('site')
@observer
class EditUserNamePage extends React.Component {
  render() {
    return (
      <ViewAdapter
        h5={
          <div>
            <UserCenterEditUserName />
          </div>
        }
        pc={null}
        title={`编辑用户名`}
      />
    );
  }
}

export default HOCFetchSiteData(HOCUserInfo(EditUserNamePage));
