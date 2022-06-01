import { defineStore } from 'pinia';
import {
  BleDevice,
  // BleService,
} from '@capacitor-community/bluetooth-le';

export interface BtnMode {
  label: string;
  mode: string;
}

export const useFlashStore = defineStore('FlashLight', {
  state: () => ({
    currDev: <BleDevice>{
      name: '',
      deviceId: '',
    },
    currBtn: <BtnMode>{},
    connectedDevs: <BleDevice[]>[],
    btnMems: <BtnMode[]>[
      {
        label: 'M1',
        mode: 'C',
      },
      {
        label: 'M2',
        mode: 'W',
      },
      {
        label: 'M3',
        mode: 'W',
      },
      {
        label: 'M4',
        mode: 'W',
      },
      {
        label: 'M5',
        mode: 'W',
      },
      {
        label: 'M6',
        mode: 'W',
      },
      {
        label: 'M7',
        mode: 'W',
      },
    ],
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
  },
});
