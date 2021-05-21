import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';

@inject('site')
@observer
class PCCloseSite extends React.Component {
  render() {
    const { site } = this.props;
    const { closeSiteConfig } = site;

    return (
      <div className={styles.page}>
        <h1 className={styles.main}>网站错误</h1>
        {closeSiteConfig && <p className={styles.sub}>{closeSiteConfig.detail}</p>}
      </div>
    );
  }
}


export default PCCloseSite;
