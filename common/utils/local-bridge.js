import LocalBridge from '@discuzq/sdk/dist/localstorage';
const localBridgeOptions = { prefix: '' };
const locals = new LocalBridge(localBridgeOptions);

export default locals;