import React from 'react';
import { Icon, Dialog, Button, Input } from '@discuzq/design';
import { View, Text } from '@tarojs/components';

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
          <View style={{display: 'flex', 'flexDirection': 'column'}}>
            <Button>编辑</Button>
            <Button onClick={() => {deletePlugin()}}>删除</Button>
            <Text>{url}</Text>
          </View>
      )
    }
}