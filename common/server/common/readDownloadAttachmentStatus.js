import api from '../api';

export default async function _readDownloadAttachmentStatus(params) {
  const res = await api.http({
    url: '/apiv3/attachment.download',
    method: 'get',
    params,
  });

  return res;
}