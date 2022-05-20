<template>
  <div class="column">
    <!-- button functions -->
    <div class="column">
      Button Functions:
      <q-list bordered>
        <q-item>
          <q-item-section class="col-4 text-center"> H </q-item-section>
          <q-item-section class="col">
            <div class="text-center">
              <q-btn-toggle
                v-model="mode.H"
                toggle-color="primary"
                :options="[
                  { label: 'ON', value: true },
                  { label: 'OFF', value: false },
                ]"
                @update:model-value="setFunc(mode.H, 6)"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="col-4 text-center"> M </q-item-section>
          <q-item-section class="col">
            <div class="text-center">
              <q-btn-toggle
                v-model="mode.M"
                toggle-color="primary"
                :options="[
                  { label: 'ON', value: true },
                  { label: 'OFF', value: false },
                ]"
                @update:model-value="setFunc(mode.M, 5)"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="col-4 text-center"> L </q-item-section>
          <q-item-section class="col">
            <div class="text-center">
              <q-btn-toggle
                v-model="mode.L"
                toggle-color="primary"
                :options="[
                  { label: 'ON', value: true },
                  { label: 'OFF', value: false },
                ]"
                @update:model-value="setFunc(mode.L, 4)"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="col-4 text-center"> C </q-item-section>
          <q-item-section class="col">
            <div class="text-center">
              <q-btn-toggle
                v-model="mode.C"
                toggle-color="primary"
                :options="[
                  { label: 'ON', value: true },
                  { label: 'OFF', value: false },
                ]"
                @update:model-value="setFunc(mode.C, 3)"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="col-4 text-center"> F1 </q-item-section>
          <q-item-section class="col">
            <div class="text-center">
              <q-btn-toggle
                v-model="mode.F1"
                toggle-color="primary"
                :options="[
                  { label: 'ON', value: true },
                  { label: 'OFF', value: false },
                ]"
                @update:model-value="setFunc(mode.F1, 2)"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="col-4 text-center"> F2 </q-item-section>
          <q-item-section class="col">
            <div class="text-center">
              <q-btn-toggle
                v-model="mode.F2"
                toggle-color="primary"
                :options="[
                  { label: 'ON', value: true },
                  { label: 'OFF', value: false },
                ]"
                @update:model-value="setFunc(mode.F2, 1)"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="col-4 text-center"> SOS </q-item-section>
          <q-item-section class="col">
            <div class="text-center">
              <q-btn-toggle
                v-model="mode.SOS"
                toggle-color="primary"
                :options="[
                  { label: 'ON', value: true },
                  { label: 'OFF', value: false },
                ]"
                @update:model-value="setFunc(mode.SOS, 0)"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-item v-show="false">
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
    const mode = ref({
      H: true,
      M: true,
      L: true,
      C: true,
      F1: true,
      F2: true,
      SOS: true,
    });

    const setFunc = (val: boolean, index: number) => {
      let num = 0;
      if (val) {
        num = 2 ** index;
      }
      console.log(num);
    };

    const confirm = () => {
      for (let item in mode.value) {
        console.log(item);
      }
    };

    return {
      mode,
      confirm,
      setFunc,
    };
  },
});
</script>
