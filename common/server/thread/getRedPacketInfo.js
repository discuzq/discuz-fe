import api from '../api';

export default async function getRedPacketInfo(params) {
  console.log(params, 111111111)
  const res = await api.http({
    url: `/apiv3/check.user.get.redpacket?threadId=${params.params.threadId}`,
    method: 'get',
    data: params,
  });
  return res;
}
