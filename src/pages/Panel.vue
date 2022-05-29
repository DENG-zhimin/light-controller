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

      <!-- <div class="q-my-md q-gutter-y-sm" v-if="connectedDev.length > 0">
        已连接设备：
        <q-card v-for="(ble, index) in connectedDev" :key="index">
          <q-card-section
            :class="
              ble.deviceId === currDev.deviceId ? 'bg-primary text-white' : ''
            "
            clickable
            v-ripple
            @click.stop="selDev(ble)"
          >
            {{ ble.name + ' -- ' + ble.deviceId }}
          </q-card-section>
        </q-card>
      </div> -->
      <!-- control panel -->
      <div
        class="col column full-width q-gutter-y-lg q-mb-lg items-center q-mt-md"
      >
        <!-- power switch -->
        <!-- <div class="row justify-center q-mb-md">
          <q-btn
            round
            :icon="powerStat ? 'las la-sun ' : 'las la-power-off'"
            :color="powerStat ? 'grey-2' : 'grey-6'"
            :text-color="powerStat ? 'grey-6' : 'grey-2'"
            @click.stop="powerSwitch"
          />
        </div> -->
        <q-space></q-space>
        <div class="row" v-if="showColorPicker">
          <color-picker
            v-bind="color"
            variant="persistent"
            @input="onColorInput"
            @select="colorSelect"
          >
          </color-picker>
        </div>

        <q-space></q-space>
        <div class="row full-width justify-center q-mb-md">
          <div class="col-11" style="max-width: 400px">
            <q-slider
              v-model="lVolume"
              :min="0"
              :max="255"
              thumb-size="22px"
              track-size="16px"
              track-color="grey-6"
              color="grey-2"
              label-color="grey-6"
              :marker-labels="markerLable"
              @update:model-value="onLChange"
              :label-value="lVLabel"
              label-always
            >
            </q-slider>
          </div>
        </div>
        <div class="q-mb-lg">
          <q-btn-toggle
            v-model="fmode"
            color="grey-5"
            toggle-color="grey-2"
            toggle-text-color="grey-7"
            :options="fmodeOpt"
            class="full-width"
            @update:model-value="setMode"
          />
        </div>

        <!-- params display window -->
        <div
          class="row q-pl-md q-mt-md q-mb-sm inset-shadow-down shadow-2 bg-grey-5 text-grey-7 q-py-sm display-box"
          style="width: 70%"
          v-if="false"
        >
          <div class="row item-center q-gutter-y-sm">
            <!-- <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">开关状态：</div>
              <div class="col-7 q-pl-md">{{ powerStat ? 'ON' : 'OFF' }}</div>
            </div> -->
            <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">亮度：</div>
              <div class="col-7 q-pl-md">{{ lVolume }}</div>
            </div>
            <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">模式：</div>
              <div class="col-7 q-pl-md">{{ fmode }}</div>
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
  watch,
} from 'vue';
import { BleClient, BleService } from '@capacitor-community/bluetooth-le';
import ColorPicker from '@radial-color-picker/vue-color-picker';
import Convert from 'color-convert';
import { useRouter } from 'vue-router';
import { useBleStore } from 'src/stores/ble';
import { storeToRefs } from 'pinia';
import { bleDev, encode } from 'src/utils/util';

export default defineComponent({
  name: 'PanelPage',
  components: { ColorPicker },
  setup() {
    const router = useRouter();
    const bleStore = useBleStore();

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
    let { currDev, btnMode } = storeToRefs(bleStore);

    const ble_enabled = ref(false);
    // const see_all = ref(false)
    const error = ref('');
    // const eq = 61; // equal
    // const comma = 44;

    // const powerStat = ref(false);

    // light volume
    const lVolume = ref(255);

    const lVLabel = computed(() => {
      return Math.round((lVolume.value / 255) * 100) + '%';
    });

    interface FModeOpt {
      label: string;
      value: string;
    }

    const fmodeOpt = computed(() => {
      let ret = <FModeOpt[]>[];
      btnMode.value.forEach((mod) => {
        if (mod.status) {
          const newMod = {
            label: mod.mode,
            value: mod.mode,
          };
          ret.push(newMod);
        }
      });
      return ret;
    });

    const showColorPicker = computed(() => {
      let val = false;
      btnMode.value.forEach((mod) => {
        if (mod.status && mod.mode === 'C') {
          val = true;
        }
      });
      return val;
    });

    // 手电工作模式
    // const fmode = ref('M');
    let defMode = '';
    if (fmodeOpt.value.length > 0) {
      defMode = fmodeOpt.value[0].value; // default mode
    }
    const fmode = ref(defMode);

    // watch the mode value to adjust the light volume.
    watch(fmode, (newVal) => {
      switch (newVal) {
        case 'H':
          lVolume.value = 255;
          break;
        case 'M':
          lVolume.value = 127;
          break;
        case 'L':
          lVolume.value = 64;
          break;
        default:
          // lVolume.value = 127;
          break;
      }
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
      if (fmode.value !== 'C') {
        fmode.value = 'C';
      }

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
      fmode.value = '';
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
      let param1 = 0,
        param2 = 0,
        param3 = 0;
      let comm = fmode.value;
      switch (fmode.value) {
        case 'H':
          comm = 'W';
          param1 = 255;
          break;
        case 'M':
          comm = 'W';
          param1 = 128;
          break;
        case 'L':
          comm = 'W';
          param1 = 50;
          break;
        case 'C':
          param1 = rgb.value[0];
          param2 = rgb.value[1];
          param3 = rgb.value[2];
          break;
        default:
          break;
      }
      const command = encode(comm, param1, param2, param3);
      send(command);
    };

    const colorSelect = (hue: number) => {
      // send color
      onColorInput(hue);
      // console.log('select');
    };

    // onBeforeMount(init);
    // onMounted(getConnDev);
    onMounted(function () {
      init();
    });

    return {
      showColorPicker,
      lVLabel,
      markerLable,
      origColor,
      fmode, // flash mode
      fmodeOpt,
      bleSrvs,
      currDev,
      error,
      color,
      rgb,
      lVolume, // light volume, luminosity
      // powerStat, // power status
      // powerSwitch,
      setMode,
      onColorInput,
      onLChange,
      getDev,
      colorSelect,
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
  border: solid 1px white;
}
</style>
