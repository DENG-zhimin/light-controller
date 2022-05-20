<template>
  <div class="column items-center bg-grey-4 full-height">
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
            无连接设备
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
      <div class="col column q-gutter-y-lg q-mb-lg items-center q-mt-md">
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
        <div class="row full-width justify-center q-mb-md">
          <div class="col-11">
            <q-slider
              v-model="lVolume"
              :min="0"
              :max="255"
              thumb-size="22px"
              track-size="16px"
              color="grey-2"
              @update:model-value="onLChange"
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
        <color-picker
          v-bind="color"
          @input="onColorSelect"
          variant="persistent"
        >
        </color-picker>
        <div
          class="row q-pl-md q-mt-md q-mb-sm inset-shadow-down shadow-2 bg-grey-5 text-grey-7 q-py-sm display-box"
          style="width: 70%"
          v-if="false"
        >
          <div class="row item-center q-gutter-y-sm">
            <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">开关状态：</div>
              <div class="col-7 q-pl-md">{{ powerStat ? 'ON' : 'OFF' }}</div>
            </div>
            <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">亮度：</div>
              <div class="col-7 q-pl-md">{{ lVolume }}</div>
            </div>
            <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">模式：</div>
              <div class="col-7 q-pl-md">{{ fmode }}</div>
            </div>
            <div class="full-width row col-12 justify-center">
              <div class="col-4 text-right">RGB 色彩：</div>
              <div class="col-7 q-pl-md">{{ rgb }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive } from 'vue';
import { BleClient, BleService } from '@capacitor-community/bluetooth-le';
import ColorPicker from '@radial-color-picker/vue-color-picker';
// import { hslToRgb } from 'src/utils/util';
import Convert from 'color-convert';
// import encoder from 'src/utils/encoding';
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
    // Ble transparent transfer

    // current dev
    let { currDev } = storeToRefs(bleStore);

    const ble_enabled = ref(false);
    // const see_all = ref(false)
    const error = ref('');
    // const eq = 61; // equal
    // const comma = 44;

    const powerStat = ref(false);

    // light volume
    const lVolume = ref(127);

    // 手电工作模式
    const fmode = ref('M');

    // device mode
    const fmodeOpt = ref([
      { label: 'H', value: 'H' },
      { label: 'M', value: 'M' },
      { label: 'L', value: 'L' },
      { label: 'C', value: 'C' },
      { label: 'F1', value: 'F1' },
      { label: 'F2', value: 'F2' },
      { label: 'SOS', value: 'SOS' },
    ]);

    // light color
    const color = reactive({
      hue: 50,
    });

    // default rgb color
    const rgb = ref(<number[]>Convert.hsl.rgb(50, 100, 50));

    const commandCode = {
      C: 1, // color
      W: 4, // white
      F1: 5, // flash 1
      F2: 6, // flash 2
      SOS: 7, // sos mode
      SET: 8, // settings
    };

    // action flag
    const act = ref(true);

    console.log(commandCode);

    // triggle at color ring change
    const onColorSelect = (hue: number) => {
      color.hue = hue; // for number to display on page.
      rgb.value = Convert.hsl.rgb([hue, 100, 50]); // convert color from hsl to rgb
      const command = encode('C', rgb.value[0], rgb.value[1], rgb.value[2]); // encode command to DataView
      slowSend(command); // send
    };

    // on light volume change
    const onLChange = (val: number | null) => {
      if (val === null) return false;
      const command = encode('W', val);
      slowSend(command);
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
      console.log('sended');
      // return if no currdev
      if (!currDev.value.deviceId) return false;
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

    // onBeforeMount(init);
    // onMounted(getConnDev);
    onMounted(function () {
      init();
    });

    return {
      fmode, // flash mode
      fmodeOpt,
      bleSrvs,
      currDev,
      error,
      color,
      rgb,
      lVolume, // light volume, luminosity
      powerStat, // power status
      // powerSwitch,
      setMode,
      onColorSelect,
      onLChange,
      getDev,
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
