<template>
  <div class="column">
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
                toggle-color="primary"
                :options="[
                  { label: 'ON', value: true },
                  { label: 'OFF', value: false },
                ]"
              />
              <!-- @update:model-value="setFunc(m)" -->
            </div>
          </q-item-section>
        </q-item>

        <q-item v-show="true">
          <q-item-section class="col-5 q-my-xs q-mx-auto">
            <q-btn label="confirm" @click="confirm" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
// import { bleDev } from 'src/utils/util';

export default defineComponent({
  name: 'SettingsPage',
  setup() {
    //
    interface BtnMode {
      mode: string;
      index: number;
      status: boolean;
    }
    const btnMode = ref(<BtnMode[]>[
      {
        mode: 'H',
        index: 6,
        status: true,
      },
      {
        mode: 'M',
        index: 5,
        status: true,
      },
      {
        mode: 'L',
        index: 4,
        status: true,
      },
      {
        mode: 'C',
        index: 3,
        status: true,
      },
      {
        mode: 'F1',
        index: 2,
        status: true,
      },
      {
        mode: 'F2',
        index: 1,
        status: true,
      },
      {
        mode: 'SOS',
        index: 0,
        status: true,
      },
    ]);

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
    };

    return {
      btnMode,
      confirm,
      // setFunc,
    };
  },
});
</script>
