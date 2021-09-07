import React from 'react';
import { Icon, Dialog, Button, Input } from '@discuzq/design';

export default class CustomIframPostContent extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
      }
    }
  
    render() {
      const { _pluginInfo, renderData, deletePlugin, updatePlugin } = this.props;
      if ( !renderData ) {
        return null;
      }
      const { body, tomId } = renderData;
      const { url } = body;
      return (
          <div style={{display: 'flex', 'flexDirection': 'column'}}>
            <button onClick={() => {
              updatePlugin({
                postData: {
                  tomId,
                  body: {
                    url: 'https://baidu.com',
                  }
                }
              })
            }}>编辑</button>
            <button onClick={() => {deletePlugin()}}>删除</button>
            <iframe src={url} width='450' height='500'></iframe>
          </div>
      )
    }
}