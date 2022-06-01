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
        class="col column full-width q-gutter-y-lg q-mb-lg items-center q-mt-md"
      >
        <!-- <q-space></q-space> -->
        <div v-if="currBtn.mode === 'C'">
          <q-color
            v-model="hex"
            no-header
            no-footer
            class="my-picker"
            :disable="tuneFlag"
          />
        </div>
        <!-- <q-space></q-space> -->
        <div
          v-if="currBtn.mode === 'W'"
          class="row full-width justify-center q-mb-md"
        >
          <!-- white balance slider -->
          <div class="col-11 row items-center">
            <!-- style="max-width: 500px" -->
            <div class="col-1 text-center q-pt-md">
              <q-btn
                rounded
                padding="none"
                icon="las la-angle-left"
                @click="wBVal -= 1"
                class="q-mr-sm"
                :disable="tuneFlag"
              />
              <!-- v-touch-repeat.mouse="wBValRepeat" -->
            </div>
            <div class="col-10 row items-center">
              <!-- style="height: 100px" -->
              <div class="full-width" style="position: relative">
                <div class="wb full-width"></div>
                <q-slider
                  v-model="wBVal"
                  :min="-255"
                  :max="255"
                  thumb-size="16px"
                  thumb-color="grey-8"
                  track-size="20px"
                  track-color="transparent"
                  color="transparent"
                  label-color="grey-6"
                  @update:model-value="onLChange"
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
                @click="wBVal += 1"
                icon="las la-angle-right"
                class="q-ml-sm"
                :disable="tuneFlag"
              />
            </div>
          </div>
          <!-- light volume slider -->
          <div class="col-10 row q-mt-lg" style="max-width: 400px">
            <q-slider
              v-model="lVVal"
              :min="0"
              :max="255"
              thumb-size="16px"
              thumb-color="grey-8"
              track-size="20px"
              track-color="grey-5"
              color="grey-2"
              label-color="grey-6"
              @update:model-value="onLChange"
              :label-value="lVLabel"
              label-always
              :disable="tuneFlag"
            >
              <!-- thumb-path="1,0 -12,0" -->
            </q-slider>
          </div>
        </div>

        <div class="q-mb-lg shadow-1 q-pa-sm btn-grp">
          <div class="row justify-evenly">
            <q-btn size="sm" @click="tuneFlag = false"> TUNE</q-btn>
            <q-btn size="sm"> CONFIRM</q-btn>
          </div>
          <div>
            {{ hex }}
          </div>
          <div>
            {{ lVVal }}
          </div>
          <div>
            {{ currBtn }}
          </div>
          <hr />
          <div class="row justify-center q-gutter-sm">
            <q-btn
              v-for="btn in btnMems"
              :key="btn.label"
              :label="btn.label"
              @click.stop="setCurrBtn(btn)"
              :color="btn.label === currBtn.label ? 'grey-2' : 'grey-6'"
              :text-color="btn.label === currBtn.label ? 'grey-6' : 'grey-2'"
            />
          </div>
        </div>

        <!-- params display window -->
        <div
          class="row q-pl-md q-mt-md q-mb-sm shadow-4 bg-grey-4 text-grey-7 q-py-sm display-box"
          style="width: 70%"
          v-if="true"
        >
          <div class="row item-center q-gutter-y-sm">
            <!-- <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">开关状态：</div>
              <div class="col-7 q-pl-md">{{ powerStat ? 'ON' : 'OFF' }}</div>
            </div> -->
            <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">亮度：</div>
              <div class="col-7 q-pl-md">{{ lVVal }}</div>
            </div>
            <!--             <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">RGB 1：</div>
              <div class="col-7 q-pl-md">{{ origColor }}</div>
            </div> -->
            <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">RGB：</div>
              <div class="col-7 q-pl-md">{{ rgb }}</div>
            </div>
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
  reactive,
  computed,
  // watch,
} from 'vue';
import { BleClient, BleService } from '@capacitor-community/bluetooth-le';
// import ColorPicker from '@radial-color-picker/vue-color-picker';
import Convert from 'color-convert';
import { useRouter } from 'vue-router';
import { useFlashStore, BtnMode } from 'src/stores/flashlight';
import { storeToRefs } from 'pinia';
import { bleDev, encode } from 'src/utils/util';

export default defineComponent({
  name: 'PanelPage',
  components: {},
  setup() {
    const router = useRouter();
    const flashStore = useFlashStore();

    // var intervalHandler = 0;

    // color picker value
    const hex = ref('#3040CC');

    // memery mode
    const memMode = ref('c'); // c: color, w: whitebalance

    // color picker status
    const tuneFlag = ref(true); // default enabled

    // const markerLable = (val: number) => `${val}%`;
    const markerLable = [
      { value: 0, label: '0%' },
      { value: 64, label: '25%' },
      { value: 128, label: '50%' },
      { value: 196, label: '75%' },
      { value: 255, label: '100%' },
    ];
    // Ble transparent transfer

    // current dev
    const { currDev, currBtn, btnMems } = storeToRefs(flashStore);

    const ble_enabled = ref(false);
    // const see_all = ref(false)
    const error = ref('');
    // const eq = 61; // equal
    // const comma = 44;

    // const powerStat = ref(false);

    // white balance
    const wBVal = ref(0);

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

    // light volume slider lable
    const lVLabel = computed(() => {
      return Math.round((lVVal.value / 255) * 100) + '%';
    });

    // light color
    const color = reactive({
      hue: 50,
    });

    // default rgb color
    const rgb = ref(<number[]>Convert.hsl.rgb(50, 100, 50));

    // action flag
    const act = ref(true);

    const origColor = ref(<number[]>[]);

    // triggle at color ring change
    const onColorInput = (hue: number) => {
      color.hue = hue; // for number to display on page.
      // change fmode if not equal to 'C'

      // let origCol = new Array(3)
      origColor.value = Convert.hsl.rgb([hue, 100, 50]); // convert color from hsl to rgb
      rgb.value = reblend(origColor.value);

      const command = encode('C', rgb.value[0], rgb.value[1], rgb.value[2]); // encode command to DataView
      slowSend(command); // send
    };

    // reblend color. reduce rgb total from 0x1FF to FF
    const reblend = (data: number[]) => {
      const R = data[0];
      const G = data[1];
      const B = data[2];

      const sum = R + G + B;
      if (sum === 255) {
        return data;
      }

      if (sum === 510) {
        return [Math.floor(R / 2), Math.floor(G / 2), Math.floor(B / 2)];
      }

      if (R === 255) {
        if (G > 0) {
          // B ===0
          const bld = reCalc(R, G);
          return [bld[0], bld[1], B];
        } else {
          // G === 0
          const bld = reCalc(R, B);
          return [bld[0], G, bld[1]];
        }
      } else if (G === 255) {
        if (R > 0) {
          // B=== 0
          const bld = reCalc(G, R);
          return [bld[1], bld[0], B];
        } else {
          // R === 0
          const bld = reCalc(G, B);
          return [R, bld[0], bld[1]];
        }
      } else {
        // B === 255
        if (R > 0) {
          const bld = reCalc(B, R);
          return [bld[1], G, bld[0]];
        } else {
          // R===0
          const bld = reCalc(B, G);
          return [R, bld[1], bld[0]];
        }
      }
    };

    const reCalc = (FF: number, Small: number) => {
      const MinusNumber = Math.ceil(Small / 2);
      return [FF - MinusNumber, Small - MinusNumber];
    };

    // on light volume change
    const onLChange = (val: number | null) => {
      if (val === null) return false;
      // when change light Volume, no fmode is matched.
      // prepare command dataView
      const command = encode('W', val);
      if (val === 0 || val === 255) {
        // send immediate
        setTimeout(() => {
          send(command);
        }, 100);
      } else {
        slowSend(command);
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
      if (!currDev.value.deviceId) return null;
      if (act.value === true) {
        act.value = false; // close send window
        // open send window after 100ms
        setTimeout(() => {
          act.value = true;
        }, 100);
        // return if no currdev
        if (!currDev.value.deviceId) return false;
        await BleClient.write(
          currDev.value.deviceId,
          bleDev.tc.srvId,
          bleDev.tc.characteristicId,
          dataView
        );
      }
    };

    const send = async (
      dataView: DataView,
      charId: string = bleDev.tc.characteristicId
    ) => {
      // return if no currdev
      if (!currDev.value.deviceId) return null;
      // console.log('sended');
      await BleClient.write(
        currDev.value.deviceId,
        bleDev.tc.srvId,
        charId,
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
        ble_enabled.value = await BleClient.isEnabled();
        await BleClient.startEnabledNotifications((enabled: boolean) => {
          ble_enabled.value = enabled;
        });
      } catch (err) {
        error.value = (err as Error).message;
      }
    };

    const getDev = () => {
      router.push('/bledev');
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

    const colorSelect = (hue: number) => {
      // send color
      onColorInput(hue);
      // console.log('select');
    };

    // mem-mode
    const setCurrBtn = (btn: BtnMode) => {
      tuneFlag.value = true;
      flashStore.setCurrBtn(btn);
    };

    //
    const wBValRepeat = ({ ...newInfo }) => {
      //
      console.log(newInfo);
    };

    const stopInterval = () => {
      clearInterval();
    };

    // onBeforeMount(init);
    // onMounted(getConnDev);
    onMounted(function () {
      init();
      // set first btn to be the current btn
      flashStore.setCurrBtn(btnMems.value[0]);
    });

    return {
      currBtn,
      memMode,
      hex,
      tuneFlag,
      markerLable,
      origColor,
      bleSrvs,
      currDev,
      error,
      color,
      rgb,
      lVVal, // light volume, luminosity
      lVLabel,
      wBVal,
      wBLabel,
      btnMems,
      setMode,
      onColorInput,
      onLChange,
      getDev,
      colorSelect,
      // mem-mode
      setCurrBtn,
      wBValRepeat,
      stopInterval,
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
  // background-image: linear-gradient(to right, #9494ff, #fff, #ff9494);
  background-image: linear-gradient(to right, #0000ff, #fff, #ff0000);
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
  position: absolute;
  bottom: 35px;
}
</style>
