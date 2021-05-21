import React from 'react';
import H5Login from '@layout/user/h5/login';
import { inject } from 'mobx-react';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithNoLogin from '@middleware/HOCWithNoLogin';

@inject('site')
class Login extends React.Component {
  render() {
    return <H5Login/>;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithNoLogin(Login));
