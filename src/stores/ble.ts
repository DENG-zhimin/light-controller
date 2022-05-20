import { defineStore } from 'pinia';
import {
  BleDevice,
  // BleService,
} from '@capacitor-community/bluetooth-le';

export const useBleStore = defineStore('ble', {
  state: () => ({
    currDev: <BleDevice>{
      name: '',
      deviceId: '',
    },
    connectedDevs: <BleDevice[]>[],
  }),
  getters: {
    // doubleCount: (state) => state.counter * 2,
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
          this.connectedDevs.slice(index, 1);
        }
      });
      // clean currDev
      if (this.currDev.deviceId === ble.deviceId) {
        this.currDev.name = '';
        this.currDev.deviceId = '';
      }
    },
  },
});
