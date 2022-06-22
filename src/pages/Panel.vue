<template>
  <div class="column items-center bg-grey-4 full-height q-pb-xl">
    <div class="col column q-px-sm items-center full-width full-height">
      <div
        class="col column justify-center full-width q-gutter-y-md items-center"
      >
        <!-- color picker -->
        <div
          v-if="currBtn.index < totalMem / 2"
          class="column q-gutter-y-md full-width"
        >
          <div class="row justify-center">
            <color-picker
              v-bind="color"
              variant="persistent"
              @input="onInput"
              @select="onSelect"
            />
          </div>
          <div class="row shadow-1">
            <!-- <div class="q-pt-sm q-pl-sm">饱和度:</div> -->
            <color-slider
              v-model:initVal="hsl.sat"
              :hue="hue"
              :sat="hsl.sat"
              :lum="lum"
              :fixSaturation="false"
              @changed="onSatChange"
            />
          </div>
          <div class="row shadow-1">
            <!-- <div class="q-pt-sm q-pl-sm">亮度:</div> -->
            <color-slider
              v-model:initVal="lum"
              :hue="hue"
              :sat="sat"
              :lum="lum"
              :fixSaturation="true"
              @changed="onLumChange"
            />
          </div>
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

          <color-slider
            :initVal="lVVal"
            :max="maxLVol"
            :min="minLVol"
            :hue="0"
            :sat="0"
            :lum="50"
            @changed="onLVChange"
          />
        </div>

        <!-- params display window -->
        <div
          class="row q-pl-md q-mt-md q-mb-sm shadow-4 bg-grey-4 text-grey-7 q-py-sm display-box"
          style="width: 100%"
          v-show="false"
        >
          <div class="row item-center q-gutter-y-sm">
            <!-- <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">开关状态：</div>
              <div class="col-7 q-pl-md">{{ powerStat ? 'ON' : 'OFF' }}</div>
            </div> -->
            <div class="full-width row col-12 justify-center">
              <div class="col-5 text-right">白光灯亮度：{{ lVVal }}</div>
            </div>
            <div class="full-width row col-12 justify-center">
              <div class="col-7 q-pl-md"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="full-width shadow-2 btn-grp">
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

        <div class="column justify-center q-py-sm bg-grey-7 q-px-sm">
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
import ColorPicker from '@radial-color-picker/vue-color-picker';
import { useFlashStore, BtnMode } from 'src/stores/flashlight';
import { storeToRefs } from 'pinia';
import { bleDev, encode } from 'src/utils/util';
import Convert from 'color-convert';
// import { useRouter } from 'vue-router';
// import { useQuasar } from 'quasar';
import ColorSlider from 'src/components/ColorSlider.vue';

export default defineComponent({
  name: 'PanelPage',
  components: { ColorPicker, ColorSlider },
  setup() {
    // const $q = useQuasar();
    // const router = useRouter();
    const flashStore = useFlashStore();
    // var intervalHandler = 0;

    // current dev
    const { hsl, saveFlag, totalMem, currDev, currBtn, btnMems, sendInterval } =
      storeToRefs(flashStore);

    const hue = ref(50);
    const sat = ref(100);
    const lum = ref(50);

    // const hsl = reactive({
    //   hue: 50,
    //   sat: 100,
    //   lum: 50,
    // });

    // color params for color-picker
    const color = reactive({
      hue: hue.value,
      saturation: sat.value,
      luminosity: lum.value,
      alpha: 1,
    });

    //  trigged by color picker
    const onInput = (newHue: number) => {
      hue.value = newHue;
      saveFlag.value = false;
      // convert color from hsl to rgb.
      const rgbVal = Convert.hsl.rgb(newHue, sat.value, lum.value);
      // encode to dataview
      const comm = encode('TUNE', ...rgbVal);
      slowSend(comm); // send
    };

    //  trigged by color picker
    const onSelect = (newHue: number) => {
      hue.value = newHue;
      // convert color from hsl to rgb.
      const rgbVal = Convert.hsl.rgb(newHue, sat.value, lum.value);
      // encode to dataview
      const comm = encode('TUNE', ...rgbVal);
      directSend(comm); // send
    };

    const onLVChange = (newVal: number) => {
      lVVal.value = newVal;
    };

    // color picker status
    const tuneFlag = ref(false); // default enabled

    // const markerLable = (val: number) => `${val}%`;
    // const markerLable = [
    //   { value: 0, label: '0%' },
    //   { value: 64, label: '25%' },
    //   { value: 128, label: '50%' },
    //   { value: 196, label: '75%' },
    //   { value: 255, label: '100%' },
    // ];
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
    const maxLVol = 100;

    // light volume slider lable
    const lVLabel = computed(() => {
      return Math.round((lVVal.value / 255) * 100) + '%';
    });

    // light color
    // const color = reactive({
    //   hue: 50,
    // });

    // action flag, to control the command sending frequency
    const act = ref(true);

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

      const comm = encode(
        'TUNE',
        wBFin.value[0],
        0,
        wBFin.value[1],
        lVVal.value
      );
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
      const code = dataView.getUint8(1); // command code
      if (code === 1) {
        // 1: TUNE
        updateCurrBtn(dataView);
      }
      // send after 100ms
      setTimeout(() => {
        bleSend(dataView);
      }, 100);
    };

    const updateCurrBtn = (dataView: DataView) => {
      currBtn.value.P1 = dataView.getUint8(2);
      currBtn.value.P2 = dataView.getUint8(3);
      currBtn.value.P3 = dataView.getUint8(4);
      currBtn.value.P4 = dataView.getUint8(5);

      // syncronize color picker
      const btnHsl = Convert.rgb.hsl(
        currBtn.value.P1,
        currBtn.value.P2,
        currBtn.value.P3
      );

      color.hue = btnHsl[0];
      hsl.value.sat = btnHsl[1];
      hue.value = btnHsl[0];
      sat.value = btnHsl[1];
      lum.value = btnHsl[2];

      console.log(hsl, currBtn.value);
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

    // mem-mode
    const setCurrBtn = (btn: BtnMode) => {
      // syncronize light volume slider
      lVVal.value = btn.P4;
      // tuneFlag.value = true;
      flashStore.setCurrBtn(btn);

      lVVal.value = btn.P4;
      const percent = Math.ceil((lVVal.value / maxLVol) * 100) / 100;
      if (percent === 0) {
        wBVal.value = 0; // white light is zero
      } else {
        // calculate wBVal base on light value percent
        wBVal.value = Math.ceil(btn.P1 / percent + (btn.P3 * -1) / percent);
      }
      // send command to device
      const comm = encode('TUNE', btn.P1, btn.P2, btn.P3, btn.P4);
      directSend(comm);
    };

    //
    const wBValCountDown = ({ ...newInfo }) => {
      //
      if (wBVal.value <= -maxWBVal) return null;
      const { repeatCount } = newInfo;
      if (wBVal.value - repeatCount <= -maxWBVal) {
        wBVal.value = -maxWBVal;
      } else {
        wBVal.value -= repeatCount;
      }
      onWBLChange();
    };
    const wBValCountUp = ({ ...newInfo }) => {
      //
      if (wBVal.value >= maxWBVal) return null;
      const { repeatCount } = newInfo;
      if (wBVal.value + repeatCount >= maxWBVal) {
        wBVal.value = maxWBVal;
      } else {
        wBVal.value += repeatCount;
      }
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
      btnMems.value.forEach((el) => {
        // make command
        const stat = el.stat === true ? 1 : 0;
        const comm = encode(
          'SAVEMEM',
          el.index,
          el.P1,
          el.P2,
          el.P3,
          el.P4,
          stat
        );
        directSend(comm);
      });
    };

    const onSatChange = (val: number) => {
      sat.value = val;

      color.saturation = val;
    };

    const onLumChange = (val: number) => {
      lum.value = val;
      color.luminosity = val;
    };

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
      hsl,
      color,
      hue,
      sat,
      lum,
      saveFlag,
      totalMem, // total memory buttons number
      currBtn,
      tuneFlag,
      // markerLable,
      bleSrvs,
      currDev,
      error,
      // color,
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
      onInput,
      onSelect,
      onLVChange,
      onWBLChange,
      // mem-mode
      setCurrBtn,
      wBValCountDown,
      wBValCountUp,
      getBtnStyle,
      saveMem,
      chgStat,
      onSatChange,
      onLumChange,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@radial-color-picker/vue-color-picker/dist/vue-color-picker.css';

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
  border: solid 1px $grey-3;
}
.pushed {
  box-shadow: 0px 0px 1px 2px $yellow-3;
}

// .lu-bar {
//   height: 20px;
//   width: 100%;
//   background-image: linear-gradient(to right, $lumiMin, $lumiMid, $lumiMax);
// }
</style>
