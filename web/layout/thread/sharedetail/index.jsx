/**
 * 页面用于渲染 http://localhost:9527/search/result?keyword=
 *
 * */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import BaseLayout from '@components/base-layout';
import SharePacket from '@components/thread/share-packet';

import styles from './index.module.scss';

 @observer
class Sharedetail extends React.Component {
   constructor(props) {
     super(props);

     const keyword = this.props.router.query.keyword || '';

     this.state = {
       keyword,
     };
   }


   componentDidMount() {

   }

   render() {
     return (
       <BaseLayout allowRefresh={false} pageName="h5SearchResult">
        <SharePacket></SharePacket>
       </BaseLayout>
     );
   }
 }

export default withRouter(Sharedetail);

