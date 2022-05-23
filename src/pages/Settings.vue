<template>
  <div class="column bg-grey-4 q-pa-md full-width full-height">
    <!-- button functions -->
    <div class="column">
      Button Functions:
      <q-list bordered>
        <q-item v-for="(m, index) in btnMode" :key="index">
          <q-item-section class="col-4 text-center">
            {{ m.mode }}
          </q-item-section>
          <q-item-section class="col">
            <div class="text-center">
              <q-btn-toggle
                v-model="m.status"
                toggle-text-color="grey-2"
                toggle-color="grey-6"
                :options="[
                  { label: 'ON', value: true },
                  { label: 'OFF', value: false },
                ]"
              />
              <!-- @update:model-value="setFunc(m)" -->
            </div>
          </q-item-section>
        </q-item>

        <!-- <q-item >
          <q-item-section class="col-5 q-my-xs q-mx-auto">
            <q-btn color="grey-6" label="confirm" @click="confirm" />
          </q-item-section>
        </q-item> -->
      </q-list>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
// import { bleDev } from 'src/utils/util';
import { storeToRefs } from 'pinia';
import { useBleStore } from 'src/stores/ble';

export default defineComponent({
  name: 'SettingsPage',
  setup() {
    //
    const bleStore = useBleStore();
    const { btnMode } = storeToRefs(bleStore);

    // const setFunc = (m: BtnMode) => {
    //   const val = 2 ** m.index;
    //   console.log(val)
    // };

    const confirm = () => {
      let ret = 0;
      btnMode.value.forEach((mode) => {
        if (mode.status) {
          ret += 2 ** mode.index;
        }
      });
      console.log(ret);

      const b = 32;
      const res = ret & b;
      console.log(res);
    };

    return {
      btnMode,
      confirm,
      // setFunc,
    };
  },
});
</script>
