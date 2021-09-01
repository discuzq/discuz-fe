import React from 'react';
import { Icon, Dialog, Button, Input } from '@discuzq/design';
import { View } from '@tarojs/components';

export default class CustomIfram extends React.PureComponent {
    constructor(props) {
      super(props);
    }
  
    render() {
      return (
          <>
            <Icon
                onClick={e => {
                    e.stopPropagation();
                    this.props.showPluginDialog(
                        <View>
                            输入iframe地址
                            <Input value='https://lichess.org/training/frame?theme=brown&bg=dark'/>
                            <Button onClick={() => {
                                this.props.onConfirm({
                                    postData: {
                                        tomId: 900001,
                                        body: {
                                            url: 'https://lichess.org/training/frame?theme=brown&bg=dark'
                                        }
                                    }
                                });
                                this.props.closePluginDialog();
                            }}>确定</Button>
                            <Button onClick={() => {
                                this.props.closePluginDialog();
                            }}>关闭</Button>
                        </View>
                    );
                }}
                name='SettingOutlined'
                size="20" 
            />
        </>
      )
    }
}