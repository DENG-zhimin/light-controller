import { defineStore } from 'pinia';
import {
  BleDevice,
  // BleService,
} from '@capacitor-community/bluetooth-le';
import { LocalStorage as LS } from 'quasar';
import { computed } from 'vue';

export interface BtnMode {
  label: string;
  index: number;
  stat: boolean;
  P1: number;
  P2: number;
  P3: number;
  P4: number;
}
const totalMem = 6; // total memory key
const btnMems = computed(() => {
  const mems = <BtnMode[]>[];
  for (let i = 0; i < totalMem; i++) {
    const mem = <BtnMode>{};
    mem.label = 'M' + (i + 1);
    mem.index = i;
    mem.stat = false;
    mem.P1 = mem.P2 = mem.P3 = mem.P4 = 0;
    mems.push(mem);
  }
  return mems;
});

export const useFlashStore = defineStore('FlashLight', {
  state: () => ({
    totalMem, // total memory key
    sendInterval: 100, // 100ms
    currDev: <BleDevice>{
      name: '',
      deviceId: '',
    },
    currBtn: <BtnMode>{},
    connectedDevs: <BleDevice[]>[],
    btnMems,
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
    saveMem(btn: BtnMode) {
      const devId = this.currDev.deviceId ? this.currDev.deviceId : 'default';
      const key = devId + '.' + btn.index;
      // LS.set(this.currDev.deviceId, JSON.stringify(this.btnMems));
      LS.set(key, btn);
      const stInfo = LS.getItem(key) as BtnMode;
      console.log(stInfo);
    },
    // saveMem(index: number) {
    //   if (index < 4) {
    //     // save color mem
    //   } else {
    //     // save wb mem
    //   }
    // },
  },
});
