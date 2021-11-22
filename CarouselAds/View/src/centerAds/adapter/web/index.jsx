import Carousel from './carousel';

export default function WebCenterAds (props) {

  const shopStore = props.pluginStore;
console.log('shopStore...',shopStore);
  return (
    <div>
      <Carousel {...props}></Carousel>
    </div>
  );
}
