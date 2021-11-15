import React, { useEffect, useState } from 'react';
import RankingH5 from '@layout/my/ranking/h5';
import RankingPc from '@layout/my/ranking/pc/index';
import ViewAdapter from '@components/view-adapter';
import { useRouter, withRouter } from 'next/router';
import HOCFetchSiteData from '../../../middleware/HOCFetchSiteData';

function Index() {
  const [title, setTitle] = useState('');
  const router = useRouter();
  const params = (({ page }) => {
    let pageText = '';
    switch (page) {
      case 'praise':
        pageText = '集赞';
        break;
      case 'comment':
        pageText = '评论';
        break;
      case 'share':
        pageText = '分享';
        break;
    }
    return { page, pageText };
  })(router.query);

  useEffect(() => {
    const { pageText } = params;
    setTitle(`${pageText}领红包`);
  });

  return (
    <ViewAdapter
      h5={<RankingH5 {...params}/>}
      pc={<RankingPc {...params} />}
      title={title}
    />
  );
}

export default withRouter(HOCFetchSiteData(Index));
