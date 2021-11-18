import Carousel from './carousel';

export default function (props) {
  console.log('ad give props...',props);
  const { data } = props;

  return (
    <div>
      <Carousel data={data}></Carousel>
    </div>
  );
}
