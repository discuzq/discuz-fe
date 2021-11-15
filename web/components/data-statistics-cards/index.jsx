import React from 'react';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';

import styles from './index.module.scss';

class DataStatisticsCards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderActionItems = (item) => {};

  render() {
    const { dataSource, rowCardCount } = this.props;
    const dataSourceView = dataSource.filter((item) => item.visible);
    const rowCount = dataSourceView.length > rowCardCount ? rowCardCount : dataSourceView.length;
    const itemWidth = `${100 / rowCount}%`;
    return (
      <div className={classNames(styles.cardsBox)}>
        {dataSourceView.map((item, index) => {
          return (
            <div className={styles.cardItemBox} style={{ width: itemWidth }} key={item.id || index}>
              <span className={styles.cardValue}>{item.value}</span>
              <span className={classNames(styles.cardLabel, (index + 1) % rowCount && styles.cardLabelBorder)}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
}

export default DataStatisticsCards;
