export default function formatCookie(cookieStr = '') {
  const jsonCookie = {};
  const arr = cookieStr.split(';');
  for (let i = 0; i < arr.length; i++) {
    const [key, value] = arr[i].split('=');
    jsonCookie[key.trim()] = value.trim();
  }
  return jsonCookie;
}
