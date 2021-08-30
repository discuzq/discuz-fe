import React from 'react';
import { Icon, Dialog, Button, Input } from '@discuzq/design';

export default class CustomIfram extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        visible: false
      }
    }
  
    render() {
      return (
          <>
            <Icon
                onClick={e => {
                    e.stopPropagation();
                    this.setState({
                        visible: true
                    })
                    // handleAttachClick(e, item);
                    // trggerInput(item);
                }}
                name='SettingOutlined'
                size="20" 
            />
            <Dialog
                visible={this.state.visible}
            >
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
                    this.setState({
                        visible: false
                    })
                }}>确定</Button>
                <Button onClick={() => {
                    this.setState({
                        visible: false
                    })
                }}>关闭</Button>
            </Dialog>
        </>
      )
    }
}