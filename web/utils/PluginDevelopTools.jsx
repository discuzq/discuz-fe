import React from 'react';
import { Button, Input, Dialog, Icon } from '@discuzq/design';
import styles from './PluginDevelopTools.module.scss';
import { inject, observer } from 'mobx-react';

@inject('plugin')
@observer
class PluginDevelopTools extends React.Component {
   
    constructor(props) {
        super(props);
        this.state = {
            isShowEnter: false,
            custormPlugin: ''
        }
    }

    componentDidMount() {
        if (window.localStorage.getItem('openPluginEnter')) {
            this.setState({
                isShowEnter: true
            })
        }
    }

    deletePlugin(index) {
        this.state.custormPlugin.splice(index, 1)
        this.setState({
            custormPlugin: [...this.state.custormPlugin] 
        })
    }

    render() {
        const { plugin } = this.props;
        if ( !this.state.isShowEnter ) return null;

        console.log(plugin);

        return (<div>
        
            <div className={styles.pluginDevelopToolsEnter}>
                <Icon
                    onClick={e => {
                        // e.stopPropagation();
                        // this.setState({
                        //     visible: true
                        // })
                        // // handleAttachClick(e, item);
                        // // trggerInput(item);
                    }}
                    className={styles.icon}
                    name='SettingOutlined'
                    size="18" 
                />
                <p>插件配置</p>
            </div>
            <Dialog
                title="提示"
                visible={true}
                className={styles.plguinBox}
                bodyStyle={{
                    maxHeight: '500px',
                    overflowY: 'auto'
                }}
                footer={(
                    <div>
                    <Button type="secondary" onClick={() => {}}>
                        确认
                    </Button>
                    <Button type="primary" onClick={() => {}}>
                        取消
                    </Button>
                    </div>
                )}
                width={'60%'}
                onClose={() => setVisible(false)}
                onCancel={() => setVisible(false)}
                onConfirm={() => setVisible(false)}
            >
                <Input.Textarea
                    value=''
                    placeholder="基础输入框"
                    autoFocus={true}
                    rows={10}
                    onChange={() => {}}
                />
            </Dialog>
        </div>)
    }
}

export default PluginDevelopTools;