import cosSdkUpload from './cos-sdk-upload';
import attachmentApiUpload from './attachment-api-upload';

const commonUpload = (options) => {
  const {
    files,
    type,
    qcloudCos,
    qcloudCosBucketName,
    qcloudCosBucketArea,
    qcloudCosSignUrl,
    supportImgExt,
    supportMaxSize,
  } = options;

  return Promise.all(files.map(file => {
    const opts = {
      file,
      ...options
    };

    return new Promise(async (resolve, reject) => {
      try {
        const res = await cosSdkUpload(opts);
        resolve(res);
      } catch (error) {

        try {
          const res = await attachmentApiUpload(opts);
          resolve(res);
        } catch (error) {
          reject('error');
        }

      }
    });

  }));
};

export default commonUpload;
