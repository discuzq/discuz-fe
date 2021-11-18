import React from 'react';
import Carousel from 'nuka-carousel';
import { Tag, Icon } from '@discuzq/design';
import styles from './index.module.scss';

export default class extends React.Component {
  toHref = (href) => {
    window.open(href);
  };

  render() {
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
        >
          {console.log('to render props...',this.props)}
          {this.props.data.map((item,index)=>{
            return (
              <img
                style={{ height: '100%', objectFit: 'cover' }}
                src={item.src}
                onClick={() => this.toHref(item.url)}
              />
            )
          })}
        </Carousel>
      </div>
    );
  }
}
