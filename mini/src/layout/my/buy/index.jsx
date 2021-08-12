import React from 'react';
import { inject, observer } from 'mobx-react';
import ThreadContent from '@components/thread';
import styles from './index.module.scss';
import BaseLayout from '@components/base-layout';
import { View, Text } from '@tarojs/components';

@inject('site')
@inject('index')
@observer
class Index extends React.Component {
  render() {
    const { index } = this.props;

    const { lists } = index;

    const buyThreadsList = index.getList({
      namespace: 'buy',
    });

    const totalCount = index.getAttribute({
      namespace: 'buy',
      key: 'totalCount',
    });

    const totalPage = index.getAttribute({
      namespace: 'buy',
      key: 'totalPage',
    });

    const currentPage = index.getAttribute({
      namespace: 'buy',
      key: 'currentPage',
    });

    const requestError = index.getListRequestError({ namespace: 'buy' });

    return (
      <BaseLayout
        requestError={requestError.isError}
        errorText={requestError.errorText}
        showHeader={false}
        noMore={currentPage >= totalPage}
        onRefresh={this.props.dispatch}
        showLoadingInCenter={!buyThreadsList?.length}
      >
        {buyThreadsList?.length !== 0 && (
          <View className={styles.titleBox}>
            <Text className={styles.num}>{`${totalCount || 0}`}</Text>
            条购买
          </View>
        )}

        {buyThreadsList?.map((item, index) => (
          <ThreadContent key={index} data={item} />
        ))}
      </BaseLayout>
    );
  }
}

export default Index;
