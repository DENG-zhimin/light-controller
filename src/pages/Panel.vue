<template>
  <div class="column items-center bg-grey-4 full-height q-pb-xl">
    <div class="col column q-px-sm items-center full-width full-height">
      <div
        class="col column justify-center full-width q-gutter-y-md items-center"
      >
        <!-- color picker -->
        <div v-if="currBtn.mode === 2" class="column q-gutter-y-md full-width">
          <div class="row justify-center">
            <color-picker
              v-bind="color"
              variant="persistent"
              @input="onInput"
              @select="onSelect"
            />
          </div>
          <div class="row shadow-0">
            <!-- <div class="q-pt-sm q-pl-sm">饱和度:</div> -->
            <color-slider
              :initVal="sat"
              :hue="hue"
              :sat="sat"
              :lum="lum"
              :fixSaturation="false"
              @changed="onSatChange"
            />
          </div>
          <div class="row shadow-0">
            <!-- <div class="q-pt-sm q-pl-sm">亮度:</div> -->
            <color-slider
              :initVal="lum"
              :hue="hue"
              :sat="sat"
              :lum="lum"
              :fixSaturation="true"
              @changed="onLumChange"
            />
          </div>
        </div>

        <div
          v-if="currBtn.mode === 4"
          class="column justify-center full-width bg-grey-9 full-height"
        >
          <div class="column text-h1 text-grey-3 text-center">
            <i class="mdui-icon material-icons">&#xe25f;</i>
          </div>
        </div>

        <!-- white balance sliders below -->
        <div
          v-if="currBtn.mode === 3"
          class="col-6 column full-width justify-between q-my-md"
        >
          <!-- white balance slider -->
          <div class="row items-center full-width shadow-0 q-py-md q-px-sm">
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
            :initVal="lVol"
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
              <div class="col-5 text-right">白光灯亮度：{{ lVol }}</div>
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
          <div class="row">
            <q-select
              dense
              rounded
              outlined
              v-model="currBtn.mode"
              :options="memModes"
              map-options
              emit-value
              @update:model-value="onModeChanged"
            />
          </div>

          <q-btn
            rounded
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
import { useQuasar } from 'quasar';
import ColorSlider from 'src/components/ColorSlider.vue';

export default defineComponent({
  name: 'PanelPage',
  components: { ColorPicker, ColorSlider },
  setup() {
    const $q = useQuasar();
    // const router = useRouter();
    const flashStore = useFlashStore();
    // var intervalHandler = 0;

    const tuneFlag = ref(false); // default enabled

    // current dev
    const {
      saveFlag,
      totalMem,
      currDev,
      currBtn,
      btnMems,
      sendInterval,
      memModes,
    } = storeToRefs(flashStore);

    /* const totalEnabledMem = computed(() => {
      let total = 0;
      btnMems.value.forEach((el) => {
        total += el.mode;
      });
      return total;
    }); */

    const preMode = ref(0);

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

    // triggered by light volume slider
    const onLVChange = (newVal: number) => {
      saveFlag.value = false;
      lVol.value = newVal;

      let percent = (lVol.value - minLVol) / (maxLVol - minLVol);
      percent = Math.round(percent * 100) / 100;

      let realVal = flashStore.maxLightVol * percent;

      if (realVal < flashStore.minLightVol) realVal = flashStore.minLightVol;
      if (realVal > flashStore.maxLightVol) realVal = flashStore.maxLightVol;

      let r = 0,
        g = 0,
        b = 0;

      if (wBVal.value < 0) {
        b = Math.floor(wBVal.value * percent) * -1;
      } else {
        r = Math.floor(wBVal.value * percent);
      }

      let lHsl = Convert.rgb.hsl(r, g, b);
      hue.value = lHsl[0];
      sat.value = lHsl[1];
      lum.value = lHsl[2];

      let comm = encode('TUNE', r, g, b, realVal);
      slowSend(comm);
    };

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

    const wBLabel = computed(() => {
      let ret = wBVal.value;
      if (ret < 0) {
        ret = ret * -1;
      }
      return ret;
      // return Math.round((lVolume.value / 255) * 100) + '%';
    });

    // light volume
    const lVol = ref(50);
    const minLVol = 0;
    const maxLVol = 100;

    // action flag, to control the command sending frequency
    const act = ref(true);

    // on light volume and wblance change
    const onWBLChange = () => {
      saveFlag.value = false;

      let wBFin = parseWB(wBVal.value); // [r,g,b]
      let lHsl = Convert.rgb.hsl(...wBFin);
      hue.value = lHsl[0];
      sat.value = lHsl[1];
      lum.value = lHsl[2];

      let percent = (lVol.value - minLVol) / (maxLVol - minLVol);
      percent = Math.round(percent * 100) / 100;

      let realLVol = flashStore.maxLightVol * percent;

      const comm = encode('TUNE', ...wBFin, realLVol);
      if (lVol.value === minLVol || lVol.value === maxLVol) {
        directSend(comm);
      } else {
        slowSend(comm);
      }
    };

    // parse wBVal to rgb
    const parseWB = (val: number) => {
      const percent = lVol.value / maxLVol;

      const realVal = Math.floor(val * percent);
      const wBFin = <number[]>[0, 0, 0];
      if (val > 0) {
        wBFin[0] = realVal;
      } else {
        // < 0
        wBFin[2] = -realVal;
      }
      return wBFin;
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
        // updateCurrBtn();
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
        // updateCurrBtn();
      }
      // send after 100ms
      setTimeout(() => {
        bleSend(dataView);
      }, 100);
    };

    // const updateCurrBtn = () => {

    // };

    // send comm to ble device
    const bleSend = async (dataView: DataView) => {
      // update current button
      currBtn.value.hsl = { hue: hue.value, sat: sat.value, lum: lum.value };
      currBtn.value.P4 = lVol.value;
      currBtn.value.wBVal = wBVal.value;

      if (!currDev.value.deviceId) return null;
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
      // update hsl
      preMode.value = btn.mode;
      color.hue = btn.hsl.hue;
      hue.value = btn.hsl.hue;
      sat.value = btn.hsl.sat;
      lum.value = btn.hsl.lum;
      lVol.value = btn.P4;

      flashStore.setCurrBtn(btn);

      wBVal.value = btn.wBVal;

      let lRgb = Convert.hsl.rgb(hue.value, sat.value, lum.value);

      // send command to device
      const comm = encode('TUNE', lRgb[0], lRgb[1], lRgb[2], btn.P4);
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
      if (btn.mode > 0) {
        btnClass += ' bg-blue-4';
      } else {
        btnClass += ' bg-grey-6';
      }
      return btnClass;
    };

    // change current button status
    const onModeChanged = (val: number) => {
      if (val === 0) {
        const total = chkMemModeTotal();

        if (total > 0) {
          saveFlag.value = false; // enable save button
          preMode.value = val;
          // change color mode and w/b mode value to zero
          currBtn.value.hsl.lum = 0;
          currBtn.value.P4 = 0;
          lum.value = 0;
          lVol.value = 0;
        } else {
          $q.notify({
            message: 'Need at least one memory be enabled!',
          });
          currBtn.value.mode = preMode.value;
        }
      } else {
        // change mode
        saveFlag.value = false; // enable save button
        preMode.value = val;
      }

      // send to device
      const lRgb = Convert.hsl.rgb(
        currBtn.value.hsl.hue,
        currBtn.value.hsl.sat,
        currBtn.value.hsl.lum
      );
      const comm = encode('TUNE', ...lRgb, currBtn.value.P4);
      directSend(comm);
    };

    const chkMemModeTotal = () => {
      let total = 0;
      btnMems.value.forEach((el) => {
        total += el.mode;
      });
      return total;
    };

    const saveMem = () => {
      saveFlag.value = true; // disable save button
      flashStore.saveMems();
      btnMems.value.forEach((el) => {
        // make command
        let lRgb = Convert.hsl.rgb(el.hsl.hue, el.hsl.sat, el.hsl.lum); // [r,g,b]

        const comm = encode('SAVEMEM', el.index, ...lRgb, el.P4, el.mode);
        directSend(comm);
      });
    };

    // saturation change
    const onSatChange = (val: number) => {
      saveFlag.value = false;
      sat.value = val;
      color.saturation = val;

      const tmpRgb = Convert.hsl.rgb(hue.value, val, lum.value);
      const comm = encode('TUNE', ...tmpRgb);

      if (val === 0 || val === 100) {
        directSend(comm);
      } else {
        slowSend(comm);
      }
    };

    //  luminosity change
    const onLumChange = (val: number) => {
      saveFlag.value = false;
      lum.value = val;
      color.luminosity = val;

      const tmpRgb = Convert.hsl.rgb(hue.value, sat.value, val);
      const comm = encode('TUNE', ...tmpRgb);

      if (val === 0 || val === 100) {
        directSend(comm);
      } else {
        slowSend(comm);
      }
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
      preMode,
      color,
      hue,
      sat,
      lum,
      saveFlag, // true: cannot save, false: can be saved
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
      lVol, // light volume value, luminosity
      wBVal,
      wBLabel,
      btnMems,
      memModes,
      btnGrp1, // color mode button
      btnGrp2, // white balance button
      onInput, // color picker event
      onSelect, // color picker event
      onLVChange,
      onWBLChange,
      // mem-mode
      setCurrBtn,
      wBValCountDown,
      wBValCountUp,
      getBtnStyle,
      saveMem,
      onModeChanged,
      onSatChange,
      onLumChange,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@radial-color-picker/vue-color-picker/dist/vue-color-picker.css';

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
</style>
