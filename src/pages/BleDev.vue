<template>
  <q-page class="column items-center bg-grey-4">
    <div
      v-show="true"
      class="row input-inline q-justify-center q-gutter-sm q-my-sm q-pa-sm"
    >
      <q-btn color="primary" :disable="error !== ''" @click.stop="conn"
        >Connect</q-btn
      >
      <q-btn
        color="negative"
        :disable="connectedDevs.length <= 0"
        @click.stop="disConnAll"
        >Disconnect</q-btn
      >
      <q-btn
        color="info"
        :disable="currDev.deviceId === ''"
        @click.stop="getSrvs"
        >Info</q-btn
      >
      <!--       <q-btn color="info" :disable="currDev.deviceId === ''" @click.stop="test"
        >test</q-btn
      > -->
    </div>
    <div class="col column q-pt-md q-px-sm items-center full-width full-height">
      <q-list v-if="currDev.deviceId" bordered separator class="full-width">
        <q-item>
          <q-item-section>
            {{ currDev.name + ': ' + currDev.deviceId }}
          </q-item-section>
          <q-item-section class="col-2">
            <div class="row justify-center">
              <q-btn
                flat
                round
                icon="las la-cog"
                @click.stop="getInfo(currDev)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
      <q-list v-else bordered separator class="full-width">
        <q-item>
          <q-item-section
            class="cursor-pointer text-center"
            style="min-height: 42px"
          >
            <!-- @click.stop="getDev" -->
            No Current Device
          </q-item-section>
        </q-item>
      </q-list>

      <div
        class="q-my-md q-gutter-y-sm full-width"
        v-if="connectedDevs.length > 0"
      >
        Connected Device：
        <q-list bordered separator class="full-width">
          <q-item
            v-for="ble in connectedDevs"
            :key="ble.deviceId"
            :class="
              ble.deviceId === currDev.deviceId ? 'bg-grey-6 text-white' : ''
            "
          >
            <q-item-section>
              <div class="cursor-pointer" @click.stop="setCurr(ble)">
                {{ ble.name + ': ' + ble.deviceId }}
              </div>
            </q-item-section>
            <q-item-section class="col-2">
              <div class="row justify-center">
                <q-btn
                  flat
                  round
                  icon="las la-cog"
                  @click.stop="getInfo(ble)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
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
        <ble-conn @bleConnected="bleConnected"> </ble-conn>
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
// import encoder from 'src/utils/encoding';
import { useFlashStore } from 'src/stores/flashlight';
import { storeToRefs } from 'pinia';
import { bleDev, encode } from 'src/utils/util';
// import { bleDev } from 'src/utils/util';

export default defineComponent({
  name: 'BleDev',
  components: { BleConn, SrvsList },
  setup() {
    const bleStore = useFlashStore();
    // Ble transparent transfer

    // const welcome = ref(true)
    const $q = useQuasar();
    // conncted dev array
    // const connectedDev = ref<BleDevice[]>([]);
    // current dev
    let { currDev, connectedDevs } = storeToRefs(bleStore);

    const showBleConn = ref(false);
    // show srvs dialog
    const showSrvs = ref(false);
    const ble_enabled = ref(false);
    // const see_all = ref(false)
    const error = ref('');
    // const eq = 61; // equal
    // const comma = 44;

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

    /*     const test = () => {
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
    }; */
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

    /*     const send = async (
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
        .then(() => {
          // $q.notify({
          //   message: JSON.stringify(res),
          // });
        })
        .catch((err) => {
          message: (err as Error).message;
        });
    }; */

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

    const disConnAll = () => {
      // 断开所有连接设备
      connectedDevs.value.forEach((v) => {
        BleClient.disconnect(v.deviceId);
      });
      // 清空已连接设备数据
      bleStore.rmCnted();
    };

    // for bleConn components.
    // const bleConnected = (ble: BleDevice) => {
    //   connectedDevs.value.push(ble);
    //   startNotice(ble.deviceId, bleDev.tc.srvId, bleDev.tc.characteristicId);
    //   showBleConn.value = false;
    //   $q.notify({
    //     message: '蓝牙已连接',
    //   });
    // };
    const bleConnected = (ble: BleDevice) => {
      bleStore.addConnected(ble);
      showBleConn.value = false;
      // get device info, firmware version, etc.
      getDeviceInfo(ble);
    };

    const getDeviceInfo = async (ble: BleDevice) => {
      return null; // dev
      const dataView = encode('Info');
      await BleClient.write(
        ble.deviceId,
        bleDev.tc.srvId,
        bleDev.tc.characteristicId,
        dataView
      ).then((res) => {
        console.log(res);
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
      connectedDevs.value.length = 0;
      BleClient.getConnectedDevices([]).then((res) => {
        res.forEach((v) => {
          connectedDevs.value.push(v);
        });
      });
    };

    const setCurr = (ble: BleDevice) => {
      bleStore.setCurr(ble);
    };

    const getInfo = (ble: BleDevice) => {
      console.log(ble.name);
    };

    /*  const powerSwitch = () => {
      const command = encode('p');
      send(command);
    }; */

    // onBeforeMount(init);
    // onMounted(getConnDev);
    onMounted(function () {
      init();
      getConnDev();
    });

    return {
      fmode, // flash mode
      fmodeOpt,
      connectedDevs, // [f]
      bleSrvs,
      showBleConn,
      showSrvs,
      currDev,
      error,
      conn,
      disConnAll,
      bleConnected,
      getSrvs,
      onDialogHide,
      getConnDev,
      setCurr,
      getInfo,
      startNotice,
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
