import { createReports } from '@discuzq/sdk/dist/api/thread/create-reports';

export default async function _createPosts(opts, ctx = null) {
  return await createReports({ ...opts, __context: ctx });
}
