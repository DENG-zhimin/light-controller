import { defineStore } from 'pinia';
import {
  BleDevice,
  // BleService,
} from '@capacitor-community/bluetooth-le';
import { LocalStorage as LS } from 'quasar';
import { computed } from 'vue';

export interface HSL {
  hue: number;
  sat: number;
  lum: number;
}

export interface BtnMode {
  label: string;
  index: number;
  mode: number;
  hsl: HSL;
  wBVal: number;
  // P1: number;
  // P2: number;
  // P3: number;
  P4: number;
}

interface MemMode {
  label: string;
  value: number;
}

const memModes = <MemMode[]>[
  { label: 'Disable', value: 0 },
  { label: 'Color', value: 2 },
  { label: 'W/B', value: 3 },
  { label: 'Flash 1', value: 4 },
];

const currDev = <BleDevice>{
  name: '',
  deviceId: '',
};
const totalMem = 10; // total memory key
const btnMems = computed(() => {
  let mems = <BtnMode[]>[];
  const key = currDev.deviceId ? currDev.deviceId : 'default';
  const lsMems = LS.getItem(key) as BtnMode[];
  if (lsMems) {
    mems = lsMems;
  } else {
    for (let i = 0; i < totalMem; i++) {
      const hsl = <HSL>{ hue: 50, sat: 100, lum: 0 };
      let mode = 0; // default disabled
      if (i === 0) {
        hsl.lum = 50;
        mode = 2; // color
      }
      const mem = <BtnMode>{
        label: 'M' + (i + 1),
        index: i,
        mode: mode,
        P4: 0,
        hsl: hsl,
        wBVal: 0,
      };
      mems.push(mem);
    }
  }

  return mems;
});

console.log(btnMems);

export const useFlashStore = defineStore('FlashLight', {
  state: () => ({
    orientLock: true,
    saveFlag: true,
    totalMem, // total memory key
    sendInterval: 100, // 100ms
    maxLightVol: 255, // max light volume send to device
    minLightVol: 0, // min light volume send to device
    currDev,
    currBtn: <BtnMode>{},
    connectedDevs: <BleDevice[]>[],
    btnMems,
    memModes,
  }),
  getters: {
    // doubleCount: (state) => state.counter * 2,
    cntedDevLen: (state) => state.connectedDevs.length,
  },
  actions: {
    // increment() {
    //   this.counter++;
    // },
    setCurr(ble: BleDevice) {
      // this.currDev = ble;
      this.currDev.name = ble.name;
      this.currDev.deviceId = ble.deviceId;
      // getMemInfo(ble.deviceId)
    },
    addConnected(ble: BleDevice) {
      this.connectedDevs.push(ble);
    },
    rmCnted() {
      // empty cntedDevs array
      this.connectedDevs.length = 0;
      // clean currDev
      this.currDev.name = '';
      this.currDev.deviceId = '';
    },
    rmCntedBle(ble: BleDevice) {
      // empty cntedDevs array
      this.connectedDevs.forEach((e, index) => {
        if (e.deviceId === ble.deviceId) {
          this.connectedDevs.splice(index, 1);
        }
      });
      // clean currDev
      if (this.currDev.deviceId === ble.deviceId) {
        this.currDev.name = '';
        this.currDev.deviceId = '';
      }
    },
    setCurrBtn(btn: BtnMode) {
      this.currBtn = btn;
    },

    // save single button
    // saveMem(btn: BtnMode) {
    //   const devId = this.currDev.deviceId ? this.currDev.deviceId : 'default';
    //   const key = devId + '.' + btn.index;
    //   // LS.set(this.currDev.deviceId, JSON.stringify(this.btnMems));
    //   LS.set(key, btn);
    //   const stInfo = LS.getItem(key) as BtnMode;
    //   console.log(stInfo);
    // },

    saveMems() {
      const devId = this.currDev.deviceId ? this.currDev.deviceId : 'default';
      // LS.set(this.currDev.deviceId, JSON.stringify(this.btnMems));
      LS.set(devId, this.btnMems);
    },
  },
});
