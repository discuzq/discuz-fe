import React from 'react';
import Carousel from 'nuka-carousel';
import { Icon } from '@discuzq/design';
import styles from './index.module.scss';

export default class CarouselWeb extends React.Component {
  constructor(props) {
    super(props);
  }

  toHref = (href) => {
    window.open(href);
  };

  render() {
    const { data, ...othersprops } = this.props || {};
    return (
      <div className={styles.container}>
        <Carousel
          autoplay={true}
          initialSlideHeight={150}
          withoutControls={false}
          renderCenterLeftControls={({ previousSlide }) => (
            <Icon style={{ padding:"10px" }} color="#fff" name="LeftOutlined" onClick={previousSlide} size={26}></Icon>
          )}
          renderCenterRightControls={({ nextSlide }) => (
            <Icon style={{ padding:"10px" }} color="#fff" name="RightOutlined" onClick={nextSlide} size={20}></Icon>
          )}
          {...othersprops}
        >
          {data?.map((item)=>{
            return (
              <img
                style={{ height: '100%', objectFit: 'cover' }}
                src={item?.src}
                onClick={() => this.toHref(item?.url)}
              />
            )
          })}
        </Carousel>
      </div>
    );
  }
}
