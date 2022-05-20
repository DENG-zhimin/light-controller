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

export const formatNumber = (n: number | string) => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

export const bleDev = {
  tc: {
    srvId: '0000fdee-0000-1000-8000-00805f9b34fb',
    characteristicId: '0000fda1-0000-1000-8000-00805f9b34fb', //  write and notify
    // srvId: 'f000ffc0-0451-4000-b000-000000000000',
    // characteristicId: 'f000ffc1-0451-4000-b000-000000000000', //  write and notify
  },
};

export const encode = (comm: string, param1 = 0, param2 = 0, param3 = 0) => {
  const header = 170;
  const commVal = eval('commandCode.' + comm) as number;
  const cs = header + commVal + param1 + param2 + param3;
  const buf = new ArrayBuffer(6);
  const dataView = new DataView(buf);
  dataView.setUint8(0, header);
  dataView.setUint8(1, commVal);
  dataView.setUint8(2, param1);
  dataView.setUint8(3, param2);
  dataView.setUint8(4, param3);
  dataView.setUint8(5, cs);
  return dataView;
};
