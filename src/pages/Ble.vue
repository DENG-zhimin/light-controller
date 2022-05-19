<template>
  <q-page class="column items-center bg-grey-4">
    <div
      v-show="false"
      class="row input-inline q-justify-center q-gutter-sm q-my-sm q-pa-sm"
    >
      <q-btn color="primary" :disable="error !== ''" @click.stop="conn"
        >连接</q-btn
      >
      <q-btn
        color="negative"
        :disable="connectedDev.length <= 0"
        @click.stop="disConn"
        >断开</q-btn
      >
      <q-btn
        color="info"
        :disable="currDev.deviceId === ''"
        @click.stop="getSrvs"
        >信息</q-btn
      >
      <q-btn color="info" :disable="currDev.deviceId === ''" @click.stop="test"
        >test</q-btn
      >
    </div>
    <div
      class="col column q-gutter-y-sm shadow-1 q-mt-sm q-px-sm items-center full-width"
    >
      <q-item v-if="currDev.name" class="shadow-1 full-width">
        <q-item-section class="">
          {{ currDev.name + ': ' + currDev.deviceId }}
        </q-item-section>
        <!-- <q-space></q-space> -->
        <q-item-section class="col-2">
          <div class="row justify-center">
            <q-btn flat round icon="las la-cog" @click.stop="goSettings" />
          </div>
        </q-item-section>
      </q-item>
      <div v-else class="q-my-sm">未连接设备</div>
      <div class="q-my-md q-gutter-y-sm" v-if="connectedDev.length > 0">
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
      </div>
      <!-- control panel -->
      <div class="column items-center q-mt-md">
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
    <q-dialog v-model="showSrvs" ref="srvsListDialog ">
      <div class="dialog-frame bg-white">
        <q-bar>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <srvs-list :bleSrvs="bleSrvs" />
      </div>
    </q-dialog>
    <q-dialog v-model="showBleConn" ref="bleConnDialog" @hide="onDialogHide">
      <div class="dialog-frame bg-white">
        <q-bar>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <ble-conn @bleConnected="bleConnected" @bleDisConnected="disConn">
        </ble-conn>
      </div>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive } from 'vue';
import {
  BleClient,
  BleDevice,
  BleService,
} from '@capacitor-community/bluetooth-le';
import { useQuasar } from 'quasar';
import BleConn from './BleConn.vue';
import SrvsList from './BleSrvs.vue';
import ColorPicker from '@radial-color-picker/vue-color-picker';
// import { hslToRgb } from 'src/utils/util';
import Convert from 'color-convert';
// import encoder from 'src/utils/encoding';

export default defineComponent({
  name: 'BleDev',
  components: { BleConn, SrvsList, ColorPicker },
  setup() {
    // Ble transparent transfer
    const bleDev = {
      tc: {
        srvId: '0000fdee-0000-1000-8000-00805f9b34fb',
        characteristicId: '0000fda1-0000-1000-8000-00805f9b34fb', //  write and notify
        // srvId: 'f000ffc0-0451-4000-b000-000000000000',
        // characteristicId: 'f000ffc1-0451-4000-b000-000000000000', //  write and notify
      },
    };
    // const welcome = ref(true)
    const $q = useQuasar();
    // conncted dev array
    const connectedDev = ref<BleDevice[]>([]);
    // current dev
    const currDev = ref(<BleDevice>{
      name: '',
      deviceId: '',
    });
    const showBleConn = ref(false);
    // show srvs dialog
    const showSrvs = ref(false);
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
      // sacturation: 100,
      // luminosity: 50,
      // alpha: 1,
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

    const encode = (comm: string, param1 = 0, param2 = 0, param3 = 0) => {
      const header = 170;
      const commVal = eval('commandCode.' + comm) as number;
      const cs = header + commVal + param1 + param2 + param3;
      let buf = new ArrayBuffer(6);
      let dataView = new DataView(buf);
      dataView.setUint8(0, header);
      dataView.setUint8(1, commVal);
      dataView.setUint8(2, param1);
      dataView.setUint8(3, param2);
      dataView.setUint8(4, param3);
      dataView.setUint8(5, cs);
      return dataView;
    };

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

    const test = () => {
      //
      let buf = new ArrayBuffer(9);
      let dataView = new DataView(buf);
      dataView.setUint8(0, 64); // A
      dataView.setUint8(1, 84); // T
      dataView.setUint8(2, 43); // +
      dataView.setUint8(3, 84); // T
      dataView.setUint8(4, 69); // E
      dataView.setUint8(5, 83); // S
      dataView.setUint8(6, 84); // T
      dataView.setUint8(7, 13);
      dataView.setUint8(8, 10);

      send(dataView);
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

    const getSrvs = async () => {
      bleSrvs.length = 0; // 清除原有信息。
      showSrvs.value = true; // 打开信息页面
      await BleClient.getServices(currDev.value.deviceId).then(
        (res: BleService[]) => {
          if (res.length > 0) {
            res.forEach((srv) => {
              bleSrvs.push(srv);
            });
          }
        }
      );
    };

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

    const startNotice = (devId: string, srvId: string, charId: string) => {
      BleClient.startNotifications(devId, srvId, charId, (res) => {
        // res: DataView
        // let devResult = '';
        // devResult = devResult + arrayBufferToString(res);
        $q.notify({
          message: JSON.stringify(res),
        });
      });
    };

    const conn = () => {
      showBleConn.value = true;
    };

    const disConn = () => {
      // 断开所有连接设备
      connectedDev.value.forEach((v) => {
        BleClient.disconnect(v.deviceId);
      });
      // 清空已连接设备数据
      connectedDev.value.length = 0;
      // 清空当前设备
      currDev.value.name = '';
      currDev.value.deviceId = '';
    };

    // for bleConn components.
    const bleConnected = (ble: BleDevice) => {
      connectedDev.value.push(ble);
      startNotice(ble.deviceId, bleDev.tc.srvId, bleDev.tc.characteristicId);
      showBleConn.value = false;
      $q.notify({
        message: '蓝牙已连接',
      });
    };

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

    const onDialogHide = () => {
      console.log('dialog hide.');
    };

    const getConnDev = () => {
      connectedDev.value.length = 0;
      BleClient.getConnectedDevices([]).then((res) => {
        res.forEach((v) => {
          connectedDev.value.push(v);
        });
      });
    };

    const selDev = (ble: BleDevice) => {
      currDev.value.name = ble.name;
      currDev.value.deviceId = ble.deviceId;
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

    // make method act slowly. disable 100ms after every action.
    // const slow = async (action: void) => {
    //   if (act.value === true) {
    //     action
    //     console.log('slow');
    //     act.value = false;
    //     setTimeout(() => {
    //       act.value = true;
    //     }, 500);
    //   }
    // };

    const goSettings = () => {
      alert(1);
    };

    // onBeforeMount(init);
    // onMounted(getConnDev);
    onMounted(function () {
      init();
      getConnDev();
    });

    return {
      fmode, // flash mode
      fmodeOpt,
      connectedDev, // [f]
      bleSrvs,
      showBleConn,
      showSrvs,
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
      conn,
      disConn,
      bleConnected,
      getSrvs,
      onDialogHide,
      getConnDev,
      selDev,
      test,
      goSettings,
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
