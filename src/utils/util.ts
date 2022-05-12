// eslint-disable-file
// const { Interface } = require("readline");
// import { Interface } from 'readline'

// import { def } from '@vue/shared';

// eslint-disable-next-line
export const formatTime = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  );
};

const formatNumber = (n: number | string) => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

// eslint-disable-next-line
/* export const arrayBufferToString = (arr) => {
  if (typeof arr === 'string') {
    return arr;
  }
  // arr is DataView
  const dataView = new DataView(arr);
  const ints = new Uint8Array(arr.byteLength);
  for (let i = 0; i < ints.length; i++) {
    ints[i] = dataView.getUint8(i);
  }
  arr = ints;
  let str = '';
  const _arr = arr;

  for (let i = 0; i < _arr.length; i++) {
    const one = _arr[i].toString(2),
      v = one.match(/^1+?(?=0)/);
    if (v && one.length === 8) {
      const byteLength = v[0].length;
      let store = _arr[i].toString(2).slice(7 - byteLength);
      for (let st = 1; st < byteLength; st++) {
        store += _arr[st + i].toString(2).slice(2);
      }
      str += String.fromCharCode(parseInt(store, 2));
      i += byteLength - 1;
    } else {
      str += String.fromCharCode(_arr[i]);
    }
  }
  return str;
}; */

// module.exports = {
//   formatTime: formatTime,
//   arrayBufferToString,
//   NotifyRes,
// };
// export default { formatTime, arrayBufferToString, NotifyRes };
