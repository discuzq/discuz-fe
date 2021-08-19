export const updateMyThreadAvatar = ({
  avatarUrl,
  indexStore,
}) => {
  indexStore.registerList({ namespace: 'my' });

  const { my } = indexStore.lists;

  Object.values(my.data).forEach((pageData) => {
    pageData.forEach((threadItem) => {
      if (!threadItem.user) {
        threadItem.user = {};
      }
      threadItem.user.avatar = avatarUrl;
    });
  });

  indexStore.forceUpdateList();
};
