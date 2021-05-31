import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexPCPage from '@layout/render-error/pc';
import IndexH5Page from '@layout/render-error/h5';
import getPlatform from '@common/utils/get-platform';
import isServer from '@common/utils/is-server';
@inject('site')
@observer
class CustomError extends React.Component {
  constructor(props) {
    super(props);
    const platform = isServer() ? 'static' : getPlatform(window.navigator.userAgent);
    props.site.setPlatform(platform);
  }
  componentDidMount() {
    this.props.site.setPlatform(getPlatform(window.navigator.userAgent));
  }
  render() {
    const { platform } = this.props.site;
    if ( platform === 'static' ) return null;

    if (platform === 'pc') {
      return (
        <IndexPCPage/>
      );
    }
    return <IndexH5Page/>;

  }
}

export default CustomError;
