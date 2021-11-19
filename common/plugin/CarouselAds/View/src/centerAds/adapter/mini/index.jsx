import Carousel from './carousel';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

export default function MiniCarousel (props) {
  const top = Taro.getSystemInfoSync().safeArea.top;

  console.log('ad give props...',props);
  const { data } = props;

  return (
    <View className={styles.container}>
      <Carousel data={data}></Carousel>
    </View>
  );
}
