const formatTime = (date) => {
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

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

const arrayBufferToString = (arr) => {
  if (typeof arr === 'string') {
    return arr;
  }
  const dataView = new DataView(arr);
  const ints = new Uint8Array(arr.byteLength);
  for (let i = 0; i < ints.length; i++) {
    ints[i] = dataView.getUint8(i);
  }
  arr = ints;
  var str = '',
    _arr = arr;

  for (let i = 0; i < _arr.length; i++) {
    let one = _arr[i].toString(2),
      v = one.match(/^1+?(?=0)/);
    if (v && one.length === 8) {
      let byteLength = v[0].length;
      var store = _arr[i].toString(2).slice(7 - byteLength);
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
};

module.exports = {
  formatTime: formatTime,
  arrayBufferToString,
};
