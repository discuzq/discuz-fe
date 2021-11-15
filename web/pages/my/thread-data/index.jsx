import React from 'react';
import IndexH5Page from '@layout/my/thread-data/h5';
import IndexPCPage from '@layout/my/thread-data/pc';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

class Index extends React.Component {
  render() {
    return <ViewAdapter h5={<IndexH5Page />} pc={<IndexPCPage />} />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
