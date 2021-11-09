import { inject, observer } from 'mobx-react';
import Unit from '@components/thread/all-post-paid/part-paid/units/unit';
import React from 'react';
import VideoRender from '@components/thread/all-post-paid/part-paid/renders/videoRender';

const VideoUnit = inject('threadPost')(
  observer(({ ...props }) => {
    const { threadPost = {} } = props;
    const { postData = {} } = threadPost;
    const { video = {} } = postData;

    if (!video.thumbUrl) return null;

    return (
      <Unit title={'视频'}>
        <VideoRender />
      </Unit>
    );
  }),
);

export default VideoUnit;
