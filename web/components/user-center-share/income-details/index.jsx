import React from 'react';
import { inject, observer } from 'mobx-react';
import { Icon } from '@discuzq/design';
import classNames from 'classnames';
import { priceFormat } from '@common/utils/price-format';
import styles from './index.module.scss';

class IncomeDeatails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openedMore: true,
      showMore: true,
      serverData: {
        Code: 0,
        Message: '接口调用成功',
        Data: {
          pageData: [
            {
              readNumber: 10,
              title: '小星球',
              money: 2.0,
              cid: 1,
            },
            {
              readNumber: 15,
              title: '匿名贴测试匿名贴测试匿名贴测试匿名贴测试匿名贴测试',
              money: 6.0,
              cid: 2,
            },
            {
              readNumber: 8,
              title: '小红球',
              money: 999.0,
              cid: 3,
            },
            {
              readNumber: 10,
              title: '啦啦啦啦啦',
              money: 300.0,
              cid: 4,
            },
            {
              readNumber: 7,
              title: '呵呵哈哈哈',
              money: 777.0,
              cid: 5,
            },
            {
              readNumber: 10,
              title: '小星球',
              money: 3.0,
              cid: 6,
            },
            {
              readNumber: 10,
              title: '小星球',
              money: 3.0,
              cid: 7,
            },
            {
              readNumber: 10,
              title: '小星球',
              money: 3.0,
              cid: 8,
            },
            {
              readNumber: 10,
              title: '小星球',
              money: 3.0,
              cid: 9,
            },
            {
              readNumber: 10,
              title: '小星球',
              money: 3.0,
              cid: 10,
            },
            {
              readNumber: 10,
              title: '小星球',
              money: 3.0,
              cid: 11,
            },
          ],
          currentPage: 1,
          perPage: 5,
          pageLength: 16,
          totalCount: 11,
          totalPage: 3,
        },
      },
      data: [],
      currentPage: 1,
      perPage: 5,
    };
  }

  onShowMore = () => {
    this.getPageData();
  };

  onCloseMore = () => {
    this.setState(
      {
        data: [],
        currentPage: 1,
      },
      () => {
        this.getPageData();
      },
    );
  };

  setOpenedMore = (open) => {
    console.log('>>> open', open);
    this.setState({ openedMore: open });
  };

  setShowMore = (show) => {
    this.setState({ showMore: show });
  };

  handleClick() {
    return false;
  }

  getPageData() {
    const { serverData, data, currentPage, perPage, showMore } = this.state;
    console.log(666, serverData, data, currentPage, perPage);
    console.log(777, currentPage - 1 * perPage, currentPage * perPage);
    const targetData = serverData.Data.pageData.slice((currentPage - 1) * perPage, currentPage * perPage);

    if (currentPage === 1 && targetData.length >= serverData.Data.totalCount) {
      this.setShowMore(false);
    }

    if (data.length + targetData.length >= serverData.Data.totalCount) {
      this.setOpenedMore(false);
    } else {
      this.setOpenedMore(true);
    }

    this.setState({
      data: [].concat(data, targetData),
      currentPage: currentPage + 1,
    });
  }

  componentDidMount() {
    this.getPageData();
  }

  render() {
    const { showMore, data, serverData, openedMore } = this.state;
    const { totalCount } = serverData.Data;
    const texts = {
      showMore: '查看更多',
      closeMore: '折叠',
    };
    return (
      <div className={styles.container}>
        <div className={`${openedMore && showMore ? styles.hideCover : ''}`}>
          <div className={styles.content}>
            {data.map((item, index) => {
              return (
                <div className={styles.incomeItem} key={item.cid}>
                  <span className={styles.incomeItemIcon}></span>
                  <span className={styles.incomeItemText}>
                    分享帖子“{item.title}”达{item.readNumber}人阅读
                  </span>
                  <span className={styles.incomeItemMoney}>+{priceFormat(item.money)}元</span>
                </div>
              );
            })}
          </div>
        </div>
        {showMore && (
          <div className={styles.showMore} onClick={openedMore ? this.onShowMore : this.onCloseMore}>
            <div className={styles.hidePercent}>{texts[openedMore ? 'showMore' : 'closeMore']}</div>
            <Icon className={openedMore ? styles.icon : styles.icon_d} name="RightOutlined" size={10} />
          </div>
        )}
      </div>
    );
  }
}

export default IncomeDeatails;
