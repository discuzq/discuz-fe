import React from 'react';
import Taro from '@tarojs/taro';
import { View, Swiper, SwiperItem, Image } from '@tarojs/components';
// import './index.module.scss';

const Carousel = (props) => {
  const serviceClick = url => {
    Taro.setStorageSync('webWiewUrl', url)  // 把要跳的链接 存储在storage里
    Taro.navigateTo({ url: '/indexPages/webview/index',})
  }
  return (
    <View>
      <Swiper
        className="swiper-container"
        circular
        indicatorDots
        indicatorColor="#999"
        indicatorActiveColor="#bf708f"
        autoplay
      >
        {console.log('to render props...',props)}
        {props.data.map((item,index)=>{
          return (<SwiperItem>
            <Image
              onClick={() => serviceClick(item.url)}
              style={{ width: '100%', height: '100%' }}
              src={item.src}
              mode="aspectFill"
            ></Image>
        </SwiperItem>)
        })}
      </Swiper>
    </View>
  );
};

export default Carousel;
