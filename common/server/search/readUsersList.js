import { readUsersList } from '@discuzq/sdk/dist/api/search/read-users-list';

/** ๆๅๅ่กจ
 * @param {object} params
 * @returns object
 */
export default async function _readUsersList(opts, ctx = null) {
  const res = await readUsersList({ ...opts, __context: ctx });
  return res;
}