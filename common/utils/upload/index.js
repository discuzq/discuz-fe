import cosSdkUpload from './cos-sdk-upload';
import attachmentApiUpload from './attachment-api-upload';

const upload = (options) => {
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

  debugger;
  return Promise.all(files.map(file => {
    const opts = {
      file,
      ...options
    };

    return new Promise(async resolve => {
      try {
        const res = await cosSdkUpload(opts);
        resolve(res);
      } catch (error) {
        const res = await attachmentApiUpload(opts);
        resolve(res);
      }
    });

  }));
};

export default upload;
