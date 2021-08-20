import api from '../api';

export default async function getRedPacketInfo(params) {
  const res = await api.http({
    url: `/apiv3/check.user.get.redpacket`,
    method: 'get',
    params,
  });
  return res;
}
