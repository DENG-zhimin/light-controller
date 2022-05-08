<template>
  <q-page class="column items-center">
    <div class="row input-inline q-justify-center q-gutter-sm q-my-sm q-pa-sm">
      <q-btn color="primary" :disable="error !== ''" @click="conn">连接</q-btn>
      <q-btn
        color="negative"
        :disable="connectedDev.length <= 0"
        @click="disConn"
        >断开</q-btn
      >
      <q-btn color="info" :disable="currDev.deviceId === ''" @click="getSrvs"
        >信息</q-btn
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
      <div v-else class="q-my-sm">
        未连接设备
        <!-- <div v-if="error" class="row">
          {{ error }}
        </div> -->
      </div>
      <!-- control panel -->
      <div class="column items-center q-mt-md">
        <div class="q-mb-lg full-width">
          <q-btn-toggle
            v-model="fmode"
            push
            color="grey-5"
            toggle-color="grey-2"
            toggle-text-color="grey-7"
            :options="fmodeOpt"
            class="full-width"
          />
        </div>
        <color-picker
          v-bind="color"
          @input="onColorSelect"
          variant="persistent"
        >
        </color-picker>
        <div class="row q-pl-md text-h6 q-mt-lg" style="width: 80%">
          <div class="col-1 text-red">红:</div>
          <div class="col-3 text-center text-red">{{ rgb[0] }}</div>
          <div class="col-1 text-green">绿:</div>
          <div class="col-3 text-green-9 text-center">{{ rgb[1] }}</div>
          <div class="col-1 text-blue-9">蓝:</div>
          <div class="col-3 text-blue-9 text-center">{{ rgb[2] }}</div>
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
import { defineComponent, ref, onMounted, reactive, onBeforeMount } from 'vue';
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

export default defineComponent({
  name: 'BleDev',
  components: { BleConn, SrvsList, ColorPicker },
  setup() {
    const GPrinter = {
      print: {
        srvId: 'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        characteristicId: 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
      },
      info: {
        srvId: '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        n_characteristicId: '49535343-1e4d-4bd9-ba61-23c647249616', // notify
        w_characteristicId: '49535343-8841-43f4-a8d4-ecbe34729bb3', // write
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
    // device mode
    const fmodeOpt = ref([
      { label: '100', value: '100' },
      { label: '75', value: '75' },
      { label: '50', value: '50' },
      { label: '25', value: '25' },
      { label: 'F1', value: 'F1' },
      { label: 'F2', value: 'F2' },
      { label: 'sos', value: 'sos' },
    ]);

    // light color
    const color = reactive({
      hue: 50,
      // sacturation: 100,
      // luminosity: 50,
      // alpha: 1,
    });

    // rgb color
    const rgb = ref(Convert.hsl.rgb(50, 100, 50));
    const mycolor = ref(
      'width: 100px; height: 100px; background: rgb(100,100,100)'
    );

    const onColorSelect = (hue: number) => {
      color.hue = hue;
      rgb.value = Convert.hsl.rgb([hue, 100, 50]);
      mycolor.value =
        'width: 100px; height: 100px; background: rgb(' +
        rgb.value[0] +
        ',' +
        rgb.value[1] +
        ',' +
        rgb.value[2] +
        ')';
    };

    const fmode = ref('100');

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

    const send = async () => {
      // query printer Status
      let buf;
      let dataView;
      /*
      n = 1：传送打印机状态
      n = 2：传送脱机状态
      n = 3：传送错误状态
      n = 4：传送纸传感器状态
      */
      buf = new ArrayBuffer(5);
      dataView = new DataView(buf);
      dataView.setUint8(0, 27);
      dataView.setUint8(1, 33);
      dataView.setUint8(2, 251);
      dataView.setUint8(3, 13);
      dataView.setUint8(4, 10);
      // write(deviceId: string, service: string, characteristic: string, value: DataView, options?: TimeoutOptions | undefined) => Promise<void>
      await BleClient.write(
        currDev.value.deviceId,
        GPrinter.info.srvId,
        GPrinter.info.w_characteristicId,
        dataView
      )
        .then(() => {
          $q.notify({
            message: 'send successed. ',
          });
        })
        .catch((err) => {
          message: (err as Error).message;
        });

      await BleClient.startNotifications(
        currDev.value.deviceId,
        GPrinter.info.srvId,
        GPrinter.info.n_characteristicId,
        (value) => {
          $q.notify({
            message: 'successed. ' + JSON.stringify(value),
          });
        }
      )
        .then((res) => {
          const msg = JSON.stringify(res);
          $q.notify({
            message: 'return data: ' + msg,
          });
        })
        .catch((err) => {
          $q.notify({
            message: JSON.stringify(err),
          });
          // console.log(err)
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

    onBeforeMount(init);
    onMounted(getConnDev);

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
      mycolor, // style
      onColorSelect,
      conn,
      disConn,
      bleConnected,
      getSrvs,
      onDialogHide,
      getConnDev,
      selDev,
      send,
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
</style>
