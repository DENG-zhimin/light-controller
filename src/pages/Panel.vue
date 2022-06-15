<template>
  <div class="column items-center bg-grey-4 full-height q-pb-xl">
    <div class="col column q-pt-md q-px-sm items-center full-width full-height">
      <q-list v-if="currDev.deviceId" bordered separator class="full-width">
        <q-item>
          <q-item-section
            class="cursor-pointer text-center"
            @click.stop="getDev"
          >
            {{ currDev.name + ': ' + currDev.deviceId }}
          </q-item-section>
        </q-item>
      </q-list>
      <q-list v-else bordered separator class="full-width">
        <q-item>
          <q-item-section
            class="cursor-pointer text-center"
            @click.stop="getDev"
          >
            No Device Connected
          </q-item-section>
        </q-item>
      </q-list>

      <div
        class="col column justify-center full-width q-gutter-y-lg items-center q-mt-sm"
      >
        <!-- <q-space></q-space> -->
        <div v-if="currBtn.index < totalMem / 2">
          <q-color
            v-model="rgb"
            no-header
            no-footer
            class="my-picker"
            :disable="tuneFlag"
            @update:model-value="onColorUpdate"
          />
        </div>

        <!-- white balance sliders below -->
        <div
          v-if="currBtn.index >= totalMem / 2"
          class="col-6 column full-width justify-between q-my-md"
        >
          <!-- white balance slider -->
          <div class="row items-center full-width shadow-1 q-py-md q-px-sm">
            <!-- style="max-width: 500px" -->
            <div class="col-1 text-center q-pt-md">
              <q-btn
                rounded
                padding="none"
                icon="las la-angle-left"
                :disable="tuneFlag"
                v-touch-repeat.mouse="wBValCountDown"
              />
              <!-- @click="wBVal -= 1" -->
            </div>
            <div class="col-10 row items-center q-px-xs">
              <!-- style="height: 100px" -->
              <div class="full-width" style="position: relative">
                <div class="wb full-width"></div>
                <!-- track-color="transparent" -->
                <q-slider
                  v-model="wBVal"
                  :min="-maxWBVal"
                  :max="maxWBVal"
                  thumb-size="16px"
                  thumb-color="grey-8"
                  track-size="20px"
                  track-color="transparent"
                  color="transparent"
                  label-color="grey-6"
                  @update:model-value="onWBLChange"
                  :label-value="wBLabel"
                  class="my-slider"
                  :disable="tuneFlag"
                  label-always
                />
                <!-- thumb-path="1,0 -12,0" -->
              </div>
            </div>
            <div class="col-1 text-center q-pt-md">
              <q-btn
                rounded
                padding="none"
                icon="las la-angle-right"
                :disable="tuneFlag"
                v-touch-repeat.mouse="wBValCountUp"
              />
            </div>
          </div>
          <!-- light volume slider -->
          <div class="row items-center full-width shadow-1 q-py-md q-px-sm">
            <!-- style="max-width: 500px" -->
            <div class="col-1 text-center q-pt-md">
              <q-btn
                rounded
                padding="none"
                icon="las la-angle-left"
                :disable="tuneFlag"
                v-touch-repeat.mouse="lValCountDown"
              />
              <!-- @click="wBVal -= 1" -->
            </div>
            <div class="col-10 row items-center q-px-xs">
              <!-- style="height: 100px" -->
              <div class="full-width" style="position: relative">
                <div class="lv-bar full-width"></div>
                <q-slider
                  v-model="lVVal"
                  :min="minLVol"
                  :max="maxLVol"
                  thumb-size="16px"
                  thumb-color="grey-8"
                  track-size="0px"
                  track-color="transparent"
                  color="transparent"
                  label-color="grey-6"
                  @update:model-value="onWBLChange"
                  :label-value="lVLabel"
                  :disable="tuneFlag"
                  label-always
                  style="top: -2px; position: absolute"
                />
              </div>
            </div>
            <div class="col-1 text-center q-pt-md">
              <q-btn
                rounded
                padding="none"
                icon="las la-angle-right"
                :disable="tuneFlag"
                v-touch-repeat.mouse="lValCountUp"
              />
            </div>
          </div>
        </div>

        <!-- params display window -->
        <div
          class="row q-pl-md q-mt-md q-mb-sm shadow-4 bg-grey-4 text-grey-7 q-py-sm display-box"
          style="width: 70%"
          v-if="false"
        >
          <div class="row item-center q-gutter-y-sm">
            <!-- <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">开关状态：</div>
              <div class="col-7 q-pl-md">{{ powerStat ? 'ON' : 'OFF' }}</div>
            </div> -->
            <div class="full-width row col-12 justify-center">
              <div class="col-5 text-right">白光灯亮度：</div>
              <div class="col-7 q-pl-md">{{ lVVal }}</div>
            </div>
            <!--             <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">RGB 1：</div>
              <div class="col-7 q-pl-md">{{ origColor }}</div>
            </div> -->
            <div class="full-width row col-12 justify-center">
              <div class="col-5 text-right">RGB：</div>
              <div class="col-7 q-pl-md">{{ rgb }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="shadow-1 q-ma-sm btn-grp">
        <div class="row justify-evenly q-pa-md bg-grey-5">
          <!-- <q-btn size="sm" @click="tuneFlag = !tuneFlag"> TUNE</q-btn> -->
          <q-btn
            size="sm"
            @click="chgStat"
            :class="currBtn.stat ? 'bg-grey-6' : 'bg-blue-4'"
          >
            {{ currBtn.stat ? 'disable' : 'enable' }}
          </q-btn>
          <q-btn
            size="sm"
            @click="saveMem"
            color=" white"
            :class="saveFlag ? 'bg-grey-6' : 'bg-blue-5'"
            :disable="saveFlag"
          >
            SAVE
          </q-btn>
        </div>

        <!-- <hr /> -->
        <!-- <q-separator class="q-my-sm"></q-separator> -->
        <div class="q-py-sm bg-grey-7">
          <div class="row justify-center q-gutter-x-md q-mb-sm">
            <q-btn
              round
              v-for="btn in btnGrp1"
              :key="btn.label"
              :label="btn.label"
              @click.stop="setCurrBtn(btn)"
              text-color="grey-2"
              :class="getBtnStyle(btn)"
            />
          </div>
          <div class="row justify-center q-gutter-x-md">
            <q-btn
              round
              v-for="btn in btnGrp2"
              :key="btn.label"
              :label="btn.label"
              @click.stop="setCurrBtn(btn)"
              text-color="grey-2"
              :class="getBtnStyle(btn)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
  computed,
  // watch,
} from 'vue';
import { BleClient, BleService } from '@capacitor-community/bluetooth-le';
// import ColorPicker from '@radial-color-picker/vue-color-picker';
// import Convert from 'color-convert';
import { useRouter } from 'vue-router';
import { useFlashStore, BtnMode } from 'src/stores/flashlight';
import { storeToRefs } from 'pinia';
import { bleDev, encode, parseRgb } from 'src/utils/util';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'PanelPage',
  components: {},
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const flashStore = useFlashStore();
    // var intervalHandler = 0;

    // current dev
    const { saveFlag, totalMem, currDev, currBtn, btnMems, sendInterval } =
      storeToRefs(flashStore);
    // color picker value
    // default is the first memory
    // const rgb = ref('rgb(0,0,0)')
    const rgb = ref('');
    // const rgb = ref(
    //   'rgb(' +
    //     btnMems.value[0].P1 +
    //     ',' +
    //     btnMems.value[0].P2 +
    //     ',' +
    //     btnMems.value[0].P3 +
    //     ')'
    // );

    // memery mode
    const memMode = ref('c'); // c: color, w: whitebalance

    // color picker status
    const tuneFlag = ref(false); // default enabled

    // const markerLable = (val: number) => `${val}%`;
    const markerLable = [
      { value: 0, label: '0%' },
      { value: 64, label: '25%' },
      { value: 128, label: '50%' },
      { value: 196, label: '75%' },
      { value: 255, label: '100%' },
    ];
    // Ble transparent transfer

    const btnGrp1 = computed(() => {
      const ret = <BtnMode[]>[];
      // console.log(btnMems);
      btnMems.value.forEach((e) => {
        if (e.index < totalMem.value / 2) {
          ret.push(e);
        }
      });
      return ret;
    });

    const btnGrp2 = computed(() => {
      const ret = <BtnMode[]>[];
      btnMems.value.forEach((e) => {
        if (e.index >= totalMem.value / 2 && e.index < totalMem.value) {
          ret.push(e);
        }
      });
      return ret;
    });

    const ble_enabled = ref(false);
    // const see_all = ref(false)
    const error = ref('');
    // const eq = 61; // equal
    // const comma = 44;

    // const powerStat = ref(false);

    // white balance
    const maxWBVal = 127;
    const wBVal = ref(0);
    const wBFin = ref([0, 0]); // [red,blue]

    const wBLabel = computed(() => {
      let ret = wBVal.value;
      if (ret < 0) {
        ret = ret * -1;
      }
      return ret;
      // return Math.round((lVolume.value / 255) * 100) + '%';
    });

    // light volume value
    const lVVal = ref(127);
    const minLVol = 0;
    const maxLVol = 255;

    // light volume slider lable
    const lVLabel = computed(() => {
      return Math.round((lVVal.value / 255) * 100) + '%';
    });

    // light color
    const color = reactive({
      hue: 50,
    });

    // action flag
    const act = ref(true);

    // const origColor = ref(<number[]>[]);

    // // triggle at color ring change
    const onColorUpdate = (color: string | null) => {
      if (color === null) return null;
      saveFlag.value = false;
      const rgbVal = parseRgb(color); // arr
      // const command = encode('TUNE', res[0], res[1], res[2]); // encode command to DataView
      const command = encode('TUNE', ...rgbVal);
      slowSend(command); // send
    };

    // // reblend color. reduce rgb total from 0x1FF to FF
    // const reblend = (data: number[]) => {
    //   const R = data[0];
    //   const G = data[1];
    //   const B = data[2];

    //   const sum = R + G + B;
    //   if (sum === 255) {
    //     return data;
    //   }

    //   if (sum === 510) {
    //     return [Math.floor(R / 2), Math.floor(G / 2), Math.floor(B / 2)];
    //   }

    //   if (R === 255) {
    //     if (G > 0) {
    //       // B ===0
    //       const bld = reCalc(R, G);
    //       return [bld[0], bld[1], B];
    //     } else {
    //       // G === 0
    //       const bld = reCalc(R, B);
    //       return [bld[0], G, bld[1]];
    //     }
    //   } else if (G === 255) {
    //     if (R > 0) {
    //       // B=== 0
    //       const bld = reCalc(G, R);
    //       return [bld[1], bld[0], B];
    //     } else {
    //       // R === 0
    //       const bld = reCalc(G, B);
    //       return [R, bld[0], bld[1]];
    //     }
    //   } else {
    //     // B === 255
    //     if (R > 0) {
    //       const bld = reCalc(B, R);
    //       return [bld[1], G, bld[0]];
    //     } else {
    //       // R===0
    //       const bld = reCalc(B, G);
    //       return [R, bld[1], bld[0]];
    //     }
    //   }
    // };

    // const reCalc = (FF: number, Small: number) => {
    //   const MinusNumber = Math.ceil(Small / 2);
    //   return [FF - MinusNumber, Small - MinusNumber];
    // };

    // on light volume and wblance change
    const onWBLChange = () => {
      saveFlag.value = false;
      const percent = lVVal.value / maxLVol;

      const realVal = Math.floor(wBVal.value * percent);

      if (wBVal.value > 0) {
        wBFin.value = [realVal, 0];
      } else {
        // < 0
        wBFin.value = [0, -realVal];
      }

      const comm = encode('WB', wBFin.value[0], 0, wBFin.value[1], lVVal.value);
      // directSend(comm);
      if (lVVal.value === 0 || lVVal.value === 255) {
        directSend(comm);
      } else {
        slowSend(comm);
      }
    };

    // 已经连接蓝牙设备服务
    // const bleSrvs = reactive(<BleService[]>[]);
    const bleSrvs = reactive(<BleService[]>[
      {
        uuid: '2323238923',
        characteristics: [
          {
            uuid: 'sdkjwi29387',
            properties: {
              broadcast: true,
              read: false,
              writeWithoutResponse: false,
              write: true,
              notify: false,
              indicate: false,
              authenticatedSignedWrites: false,
              extendedProperties: false,
            },
            descriptors: [],
          },
        ],
      },
    ]);

    const slowSend = async (dataView: DataView) => {
      // if (!currDev.value.deviceId) return null;
      if (act.value === true) {
        updateCurrBtn(dataView);
        act.value = false; // close send window
        // open send window after 100ms
        setTimeout(() => {
          act.value = true;
        }, sendInterval.value);
        bleSend(dataView);
      }
    };

    const directSend = (dataView: DataView) => {
      // send after 100ms
      updateCurrBtn(dataView);
      setTimeout(() => {
        bleSend(dataView);
      }, 100);
    };

    const updateCurrBtn = (dataView: DataView) => {
      currBtn.value.P1 = dataView.getUint8(2);
      currBtn.value.P2 = dataView.getUint8(3);
      currBtn.value.P3 = dataView.getUint8(4);
      currBtn.value.P4 = dataView.getUint8(5);
      rgb.value =
        'rgb(' +
        dataView.getUint8(2) +
        ',' +
        dataView.getUint8(3) +
        ',' +
        dataView.getUint8(4) +
        ')';
    };
    const bleSend = async (dataView: DataView) => {
      if (!currDev.value.deviceId) return null;
      // console.log('sended');
      await BleClient.write(
        currDev.value.deviceId,
        bleDev.tc.srvId,
        bleDev.tc.characteristicId,
        dataView
      )
        .then((/* res */) => {
          // $q.notify({
          //   message: JSON.stringify(res),
          // });
        })
        .catch((err) => {
          message: (err as Error).message;
        });
    };

    // const startNotice = (devId: string, srvId: string, charId: string) => {
    //   BleClient.startNotifications(devId, srvId, charId, (res) => {
    //     // res: DataView
    //     // let devResult = '';
    //     // devResult = devResult + arrayBufferToString(res);
    //     $q.notify({
    //       message: JSON.stringify(res),
    //     });
    //   });
    // };

    const init = async () => {
      try {
        await BleClient.initialize();
        // currBtn.value = btnMems.value[3]; // set first mem to be the default mem
        ble_enabled.value = await BleClient.isEnabled();
        await BleClient.startEnabledNotifications((enabled: boolean) => {
          ble_enabled.value = enabled;
        });
      } catch (err) {
        error.value = (err as Error).message;
      }
    };

    const getDev = () => {
      if (saveFlag.value === false) {
        $q.dialog({
          dark: true,
          title: 'Confirm',
          message: 'Data changed! Leave without SAVE?',
          persistent: true,
          cancel: true,
        })
          .onOk(() => {
            console.log('OK');
            router.push('/bledev');
          })
          .onCancel(() => {
            console.log('cancelled');
          });
      } else {
        router.push('/bledev');
      }
    };

    /*  const powerSwitch = () => {
      const command = encode('p');
      send(command);
    }; */

    // set flashligt mode
    const setMode = () => {
      //
      // const command = encode(comm, param1, param2, param3);
      // send(command);
    };

    // const colorSelect = (hue: number) => {
    //   // send color
    //   onColorInput(hue);
    //   // console.log('select');
    // };

    // mem-mode
    const setCurrBtn = (btn: BtnMode) => {
      // tuneFlag.value = true;
      flashStore.setCurrBtn(btn);
      // have P1 to P4 4 params
      rgb.value = 'rgb(' + btn.P1 + ',' + btn.P2 + ',' + btn.P3 + ')';
      lVVal.value = btn.P4;
      const percent = Math.ceil((lVVal.value / maxLVol) * 100) / 100;
      if (percent === 0) {
        wBVal.value = 0; // white light is zero
      } else {
        // calculate wBVal base on light value percent
        wBVal.value = Math.ceil(btn.P1 / percent + (btn.P3 * -1) / percent);
      }
    };

    //
    const wBValCountDown = ({ ...newInfo }) => {
      //
      if (wBVal.value <= -maxWBVal) return null;
      const { repeatCount } = newInfo;
      wBVal.value -= repeatCount;
      onWBLChange();
    };
    const wBValCountUp = ({ ...newInfo }) => {
      //
      if (wBVal.value >= maxWBVal) return null;
      const { repeatCount } = newInfo;
      wBVal.value += repeatCount;
      onWBLChange();
    };

    //
    const lValCountDown = ({ ...newInfo }) => {
      //
      if (lVVal.value <= minLVol) return null;
      const { repeatCount } = newInfo;
      lVVal.value -= repeatCount;
      onWBLChange();
    };
    const lValCountUp = ({ ...newInfo }) => {
      //
      if (lVVal.value >= maxLVol) return null;
      const { repeatCount } = newInfo;
      lVVal.value += repeatCount;
      onWBLChange();
    };

    const getBtnStyle = (btn: BtnMode) => {
      let btnClass = '';
      if (btn.index === currBtn.value.index) {
        btnClass += ' pushed';
      }
      if (btn.stat === true) {
        btnClass += ' bg-blue-4';
      } else {
        btnClass += ' bg-grey-6';
      }
      return btnClass;
    };

    const chgStat = () => {
      saveFlag.value = false; // enable save button
      currBtn.value.stat = !currBtn.value.stat; // change button status
    };

    const saveMem = () => {
      // dome something
      saveFlag.value = true; // disable save button
      flashStore.saveMems();
    };

    // const stopInterval = () => {
    //   clearInterval();
    // };

    // onBeforeMount(init);
    // onMounted(getConnDev);
    onMounted(function () {
      init();
      // set first btn to be the current btn
      const memIndex =
        currBtn.value.index === undefined ? 0 : currBtn.value.index;
      setCurrBtn(btnMems.value[memIndex]);
    });

    onBeforeUnmount(() => {
      //
    });

    return {
      saveFlag,
      totalMem, // total memory buttons number
      currBtn,
      memMode,
      tuneFlag,
      markerLable,
      bleSrvs,
      currDev,
      error,
      color,
      rgb,
      maxWBVal,
      minLVol, // min light Volume
      maxLVol, // max light Volume
      lVVal, // light volume value, luminosity
      lVLabel,
      wBVal,
      wBLabel,
      btnMems,
      wBFin,
      btnGrp1,
      btnGrp2,
      setMode,
      onWBLChange,
      getDev,
      // mem-mode
      setCurrBtn,
      wBValCountDown,
      wBValCountUp,
      lValCountDown,
      lValCountUp,
      getBtnStyle,
      saveMem,
      onColorUpdate,
      chgStat,
    };
  },
});
</script>

<style lang="scss" scoped>
// @import '@radial-color-picker/vue-color-picker/dist/vue-color-picker.css';

.dialog-frame {
  min-width: 300px;
  min-height: 500px;
  max-height: 80%;
  max-width: 90%;
}

.display-box {
  border-radius: 8px;
  border: solid 1px $grey-1;
}

.my-picker {
  width: 300px;
}

.wb {
  height: 20px;
  // background-color: #f00;
  background-image: linear-gradient(to right, #9494ff, #fff, #ff9494);
  // background-image: linear-gradient(to right, #0000ff, #fff, #ff0000);
  position: absolute;
  top: 0px;
  // margin: 0px auto;
}
.lv-bar {
  height: 20px;
  // background-color: #f00;
  // background-image: linear-gradient(to right, #9494ff, #fff, #ff9494);
  background-image: linear-gradient(to right, $grey-10, #fff);
  position: absolute;
  top: 0px;
  // margin: 0px auto;
}

.my-slider {
  // margin: 0px auto;
  position: absolute;
  top: -12px;
}

.btn-grp {
  // position: absolute;
  // bottom: 0px;
  width: 96%;
}

.pushed {
  box-shadow: 0px 0px 1px 3px $grey-2;
}
</style>
