import React from 'react';
import { Icon, Dialog, Button, Input } from '@discuzq/design';

export default class CustomIframDisplayContent extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
      }
    }
  
    render() {
      const { _pluginInfo, renderData, siteData } = this.props;
      if ( !renderData ) {
        return null;
      }
      const { body, tomId } = renderData;
      const { url } = body;
      return (
          <div style={{display: 'flex', 'flexDirection': 'column'}}>
            <iframe src={url} width={siteData.platform === 'pc' ? '450' : '100%'} height='500'></iframe>
          </div>
      )
    }
}