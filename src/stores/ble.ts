import { defineStore } from 'pinia';
import {
  BleDevice,
  // BleService,
} from '@capacitor-community/bluetooth-le';

export interface BtnMode {
  mode: string;
  index: number;
  status: boolean;
}

export const useBleStore = defineStore('ble', {
  state: () => ({
    currDev: <BleDevice>{
      name: '',
      deviceId: '',
    },
    connectedDevs: <BleDevice[]>[],
    btnMode: <BtnMode[]>[
      {
        mode: 'H',
        index: 6,
        status: true,
      },
      {
        mode: 'M',
        index: 5,
        status: true,
      },
      {
        mode: 'L',
        index: 4,
        status: true,
      },
      {
        mode: 'C',
        index: 3,
        status: true,
      },
      {
        mode: 'F1',
        index: 2,
        status: true,
      },
      {
        mode: 'F2',
        index: 1,
        status: true,
      },
      {
        mode: 'SOS',
        index: 0,
        status: true,
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
    setBtnMode(data: number) {
      this.btnMode.forEach((mode, index) => {
        if (data & (2 ** mode.index)) {
          this.btnMode[index].status = true;
        } else {
          this.btnMode[index].status = false;
        }
      });
    },
  },
});
