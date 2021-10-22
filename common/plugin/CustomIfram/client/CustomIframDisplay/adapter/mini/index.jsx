import React from 'react';
import { View, Text } from '@tarojs/components';
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
          <View>
            <Text>{url}</Text>
          </View>
      )
    }
}