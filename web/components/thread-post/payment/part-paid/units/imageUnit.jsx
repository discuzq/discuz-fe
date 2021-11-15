import { inject, observer } from 'mobx-react';
import { useSelectAll } from '@components/thread/all-post-paid/part-paid/hooks';
import Unit from '@components/thread/all-post-paid/part-paid/units/unit';
import React from 'react';
import SelectAll from '@components/thread/all-post-paid/part-paid/units/selectAll';
import ImageRender from '@components/thread/all-post-paid/part-paid/renders/imageRender';

const ImageUnit = inject('threadPost')(observer(({ ...props }) => {
  const { threadPost = {} } = props;
  const { postData = {}, partPayInfo = {} } = threadPost;
  const { images = {} } = postData;

  const { selectedImages = [] } = partPayInfo;

  const imagesArray = Object.values(images);

  if (imagesArray.length === 0) return null;

  const { setSelectAllStatus, selectAllStatus } = useSelectAll({
    dataset: imagesArray,
    selectedData: selectedImages,
  });

  const handleSelectAll = (status) => {
    if (status) {
      partPayInfo.selectedImages = imagesArray.map(item => item.id);
      setSelectAllStatus(status);
    } else {
      partPayInfo.selectedImages = [];
      setSelectAllStatus(status);
    }

    threadPost.partPayInfo = { ...threadPost.partPayInfo };
  };

  return (
      <Unit title={'图片'} rightActionRender={() => <SelectAll status={selectAllStatus} onSelect={handleSelectAll} />}>
        <ImageRender />
      </Unit>
  );
}));

export default ImageUnit;
