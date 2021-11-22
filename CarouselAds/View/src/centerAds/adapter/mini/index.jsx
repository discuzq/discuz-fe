import Carousel from './carousel';
import { View } from '@tarojs/components';

export default function MiniCenterAds (props) {
  return (
    <View>
      <Carousel {...props}></Carousel>
    </View>
  );
}
