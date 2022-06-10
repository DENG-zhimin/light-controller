import { defineStore } from 'pinia';
import {
  BleDevice,
  // BleService,
} from '@capacitor-community/bluetooth-le';

export interface BtnMode {
  label: string;
  index: number;
  stat: boolean;
  // mode: string;
  P1: number;
  P2: number;
  P3: number;
  P4: number;
  P5: number;
}

export const useFlashStore = defineStore('FlashLight', {
  state: () => ({
    sendInterval: 100, // 100ms
    currDev: <BleDevice>{
      name: '',
      deviceId: '',
    },
    currBtn: <BtnMode>{},
    connectedDevs: <BleDevice[]>[],
    btnMems: <BtnMode[]>[
      {
        label: 'M1',
        index: 1,
        stat: true,
      },
      {
        label: 'M2',
        index: 2,
        stat: true,
      },
      {
        label: 'M3',
        index: 3,
        stat: false,
      },
      {
        label: 'M4',
        index: 4,
        stat: true,
      },
      {
        label: 'M5',
        index: 5,
        stat: false,
      },
      {
        label: 'M6',
        index: 6,
        stat: true,
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
    saveMem(index: number) {
      if (index < 4) {
        // save color mem
      } else {
        // save wb mem
      }
    },
  },
});
