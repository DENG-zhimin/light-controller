<template>
  <div class="column bg-grey-4 q-pa-md full-width full-height">
    <!-- button functions -->
    <div class="column">
      <div class="text-bold q-mb-sm">Button Functions:</div>
      <q-list bordered>
        <q-item v-for="(m, index) in btnMode" :key="index">
          <q-item-section class="col-4 text-center">
            {{ m.mode }}
          </q-item-section>
          <q-item-section class="col">
            <div class="text-center">
              <!-- <q-btn-toggle
                v-model="m.status"
                toggle-text-color="grey-2"
                toggle-color="grey-7"
                :options="[
                  { label: 'ON', value: true },
                  { label: 'OFF', value: false },
                ]"
              /> -->
              <q-toggle
                keep-color
                color="blue-4"
                v-model="m.status"
                @update:model-value="btnModeChged = false"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
      <q-list>
        <q-item>
          <q-item-section class="col-5 q-my-xs q-mx-auto">
            <q-btn
              :disable="btnModeChged"
              :color="btnModeChged ? 'grey-7' : 'grey-2'"
              :text-color="btnModeChged ? 'grey-2' : 'grey-7'"
              label="confirm"
              @click="confirm"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useBleStore, BtnMode } from 'src/stores/ble';
import { encode, bleDev } from 'src/utils/util';
import { BleClient } from '@capacitor-community/bluetooth-le';

export default defineComponent({
  name: 'SettingsPage',
  setup() {
    // if btnMode value changed
    const btnModeChged = ref(true);

    const bleStore = useBleStore();
    // const { btnMode } = storeToRefs(bleStore);

    // get btnMode from store unreactive
    const btnMode = ref(
      JSON.parse(JSON.stringify(bleStore.btnMode)) as BtnMode[]
    );

    // const setFunc = (m: BtnMode) => {
    //   const val = 2 ** m.index;
    //   console.log(val)
    // };

    const confirm = async () => {
      btnModeChged.value = true;
      let mode = 0; // mode number
      // calc mode number
      btnMode.value.forEach((m: BtnMode) => {
        if (m.status) {
          mode += 2 ** m.index;
        }
      });

      bleStore.setBtnMode(mode); // change btnMode in Store

      // send mode number to ble
      if (!bleStore.currDev.deviceId) return null; // return if without currDev
      const command = encode('MODE', mode);
      BleClient.write(
        bleStore.currDev.deviceId,
        bleDev.tc.srvId,
        bleDev.tc.characteristicId,
        command
      ).catch((err) => {
        console.log(err);
      });
    };

    return {
      btnMode,
      btnModeChged,
      confirm,
      // setFunc,
    };
  },
});
</script>
