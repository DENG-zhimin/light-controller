<template>
  <q-page class="column items-center bg-grey-4">
    <div class="row input-inline q-justify-center q-gutter-sm q-my-sm q-pa-sm">
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
      class="col column q-gutter-y-sm shadow-1 q-ma-xs items-center full-width"
    >
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
      <div v-else class="q-my-sm">未连接设备</div>
      <!-- control panel -->
      <div class="column items-center q-mt-md">
        <div class="row justify-center q-mb-md">
          <q-btn
            round
            :icon="powerStat ? 'las la-sun ' : 'las la-power-off'"
            :color="powerStat ? 'grey-2' : 'grey-6'"
            :text-color="powerStat ? 'grey-6' : 'grey-2'"
            @click.stop="powerSwitch"
          />
        </div>
        <div class="row full-width justify-center q-mb-md">
          <div class="col-7">
            <q-slider
              v-model="lVolume"
              :min="0"
              :max="100"
              thumb-size="22px"
              track-size="16px"
              color="grey-2"
              @change="onLChange"
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
// import { arrayBufferToString } from 'src/utils/util';

export default defineComponent({
  name: 'BleDev',
  components: { BleConn, SrvsList, ColorPicker },
  setup() {
    // Ble transparent transfer
    const bleDev = {
      tc: {
        srvId: 'f000ffc0-0451-4000-b000-000000000000',
        characteristicId: 'f000ffc1-0451-4000-b000-000000000000', //  write and notify
      },
      at: {
        srvId: 'f000ffc0-0451-4000-b000-000000000000',
        charId: 'f000ffc2-0451-4000-b000-000000000000',
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
    const eq = 61; // equal
    const comma = 44;

    const powerStat = ref(false);

    // light volume
    const lVolume = ref(50);

    // 手电工作模式
    const fmode = ref(1);

    // device mode
    const fmodeOpt = ref([
      { label: 'L', value: 1 },
      { label: 'F1', value: 2 },
      { label: 'F2', value: 3 },
      { label: 'sos', value: 4 },
    ]);

    // light color
    const color = reactive({
      hue: 50,
      // sacturation: 100,
      // luminosity: 50,
      // alpha: 1,
    });

    // default rgb color
    const rgb = ref(Convert.hsl.rgb(50, 100, 50));

    const onColorSelect = (hue: number) => {
      color.hue = hue;
      rgb.value = Convert.hsl.rgb([hue, 100, 50]);

      let buf = new ArrayBuffer(10);
      let dataView = new DataView(buf);
      let com1 = 67; // C
      let com2 = 79; // O
      dataView.setUint8(0, com1);
      dataView.setUint8(1, com2);
      dataView.setUint8(2, eq);
      dataView.setUint8(3, rgb.value[0]);
      dataView.setUint8(4, comma);
      dataView.setUint8(5, rgb.value[1]);
      dataView.setUint8(6, comma);
      dataView.setUint8(7, rgb.value[2]);
      dataView.setUint8(8, 13);
      dataView.setUint8(9, 10);

      send(dataView);
    };

    const onLChange = () => {
      //
      let buf = new ArrayBuffer(6);
      let dataView = new DataView(buf);
      let com1 = 76; // L
      let com2 = 76; // L
      dataView.setUint8(0, com1);
      dataView.setUint8(1, com2);
      dataView.setUint8(2, eq);
      dataView.setUint8(3, lVolume.value);
      dataView.setUint8(4, 13);
      dataView.setUint8(5, 10);

      send(dataView);
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

      send(dataView, bleDev.at.charId);
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

    const send = async (
      dataView: DataView,
      charId: string = bleDev.tc.characteristicId
    ) => {
      // query printer Status
      // let buf;
      // let dataView;
      /* buf = new ArrayBuffer(5);
      dataView = new DataView(buf);
      dataView.setUint8(0, 27);
      dataView.setUint8(1, 33);
      dataView.setUint8(2, 251);
      dataView.setUint8(3, 13);
      dataView.setUint8(4, 10); */
      // write(deviceId: string, service: string, characteristic: string, value: DataView, options?: TimeoutOptions | undefined) => Promise<void>
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
      BleClient.startNotifications(
        // currDev.value.deviceId,
        // bleDev.tc.srvId,
        // bleDev.tc.characteristicId,
        devId,
        srvId,
        charId,
        (res) => {
          // res: DataView
          // let devResult = '';
          // devResult = devResult + arrayBufferToString(res);
          $q.notify({
            message: JSON.stringify(res),
          });
        }
      );
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
      startNotice(ble.deviceId, bleDev.at.srvId, bleDev.at.charId);
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

    const powerSwitch = () => {
      powerStat.value = !powerStat.value;
      let buf, dataView;
      let com1 = 79; // O
      let com2: number;
      if (powerStat.value) {
        com2 = 78; // N
      } else {
        com2 = 70; // F
      }
      buf = new ArrayBuffer(4);
      dataView = new DataView(buf);
      dataView.setUint8(0, com1);
      dataView.setUint8(1, com2);
      dataView.setUint8(2, 13);
      dataView.setUint8(3, 10);

      send(dataView);
    };

    // set flashligt mode
    const setMode = () => {
      let buf = new ArrayBuffer(6);
      let dataView = new DataView(buf);
      let com1 = 77;
      let com2 = 79;
      dataView.setUint8(0, com1);
      dataView.setUint8(1, com2);
      dataView.setUint8(2, eq);
      dataView.setUint8(3, fmode.value);
      dataView.setUint8(4, 13);
      dataView.setUint8(5, 10);

      send(dataView);
    };

    // onBeforeMount(init);
    // onMounted(getConnDev);
    onMounted(function () {
      init;
      getConnDev;
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
      powerSwitch,
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
