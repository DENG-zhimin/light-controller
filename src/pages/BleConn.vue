<template>
  <div class="q-pa-xs bg-white">
    <div class="row q-mt-sm">
      <div
        v-if="results.length > 0"
        class="col-12 row ble-list q-gutter-y-sm q-pa-sm"
      >
        <div class="col-12" v-for="(ble, indexb) in results" :key="indexb">
          <q-card>
            <q-card-section
              class="text-grey-8 bg-white"
              clickable
              v-ripple
              @click.stop="connBle(ble)"
            >
              {{ ble.name + ' -- ' + ble.deviceId }}
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div v-else>搜索中...</div>
      <div class="col-12 row justify-center" v-if="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';
import { useQuasar } from 'quasar';
import { useFlashStore } from 'src/stores/flashlight';

export default defineComponent({
  name: 'BleConn',
  emits: ['bleConnected'],
  setup(props, ctx) {
    const $q = useQuasar();
    const bleStore = useFlashStore();
    const results = ref<BleDevice[]>([]);
    const scanning = ref(false);
    // const tried_scanning = ref(false);
    const error = ref('');

    const scan = async () => {
      results.value.length = 0;
      scanning.value = true;
      // tried_scanning.value = true;
      try {
        await BleClient.requestLEScan({}, (res) => {
          const rssi = res.rssi as number;
          if (rssi > -90) {
            results.value.push(res.device);
          }
          scanning.value = false;
        });
        setTimeout(() => {
          void BleClient.stopLEScan().then(() => {
            scanning.value = false;
          });
        }, 10000);
      } catch (err) {
        error.value = (err as Error).message;
        scanning.value = false;
      }
    };

    const connBle = async (ble: BleDevice) => {
      await BleClient.connect(ble.deviceId, () => {
        // ondisconnected
        bleStore.rmCntedBle(ble);
        $q.notify({ message: ble.deviceId + ' 蓝牙连接已断开' });
      })
        .then(() => {
          ctx.emit('bleConnected', ble);
        })
        .catch((e: Error) => {
          $q.notify({
            message: e.message,
          });
        });
    };

    onMounted(scan);

    return {
      results,
      error,
      scanning,
      connBle,
    };
  },
});
</script>

<style lang="scss" scoped>
.ble-list {
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
