// eslint-disable-file
// const { Interface } = require("readline");
// import { Interface } from 'readline'

// import { def } from '@vue/shared';

// eslint-disable-next-line
const formatTime = (date: Date) => {
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

const bleDev = {
  tc: {
    srvId: '0000fdee-0000-1000-8000-00805f9b34fb',
    characteristicId: '0000fda1-0000-1000-8000-00805f9b34fb', //  write and notify
    // srvId: 'f000ffc0-0451-4000-b000-000000000000',
    // characteristicId: 'f000ffc1-0451-4000-b000-000000000000', //  write and notify
  },
};

type Comm = {
  name: string;
  val: number;
};

const commandCode = <Comm[]>[
  { name: 'TUNE', val: 1 },
  { name: 'MEM1', val: 11 },
  { name: 'MEM2', val: 12 },
  { name: 'MEM3', val: 13 },
  { name: 'MEM4', val: 14 },
  { name: 'MEM5', val: 15 },
  { name: 'MEM6', val: 16 },
];

/*
  encode command and params to dataview
  @param comm string
  @param param1 number
  @param param2 number
  @param param3 number
  @param param4 number
  return  DataView
 */
const encode = (
  comm: string,
  param1 = 0,
  param2 = 0,
  param3 = 0,
  param4 = 0,
  param5 = 0
) => {
  const header = 170; // 0xAA

  // get command code
  let commVal = 0;
  commandCode.forEach((el) => {
    if (el.name === comm) commVal = el.val;
  });

  // get cs value
  const cs = header + commVal + param1 + param2 + param3 + param4 + param5;
  const buf = new ArrayBuffer(8);
  const dataView = new DataView(buf);
  dataView.setUint8(0, header);
  dataView.setUint8(1, commVal);
  dataView.setUint8(2, param1);
  dataView.setUint8(3, param2);
  dataView.setUint8(4, param3);
  dataView.setUint8(5, param4);
  dataView.setUint8(6, param5);
  dataView.setUint8(7, cs);
  return dataView;
};

/* parse rgb string into array
  @param color color string, format: rgb(rrr,ggg,bbb)
  @return arr format: [rrr,ggg,bbb]
*/
const parseRgb = (color: string) => {
  let txt = color.replace(/rgb\(/g, ''); // delete 'rgb('
  txt = txt.replace(/\)/g, ''); // delete ')'
  const arr = txt.split(','); // change to arr
  const res = <number[]>[];
  arr.forEach((el) => {
    const val = parseInt(el);
    res.push(val);
  });
  return res;
};

export { formatTime, formatNumber, bleDev, encode, parseRgb };
