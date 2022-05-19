<template>
  <q-page class="q-pa-none bg-green">
    <!-- <q-card> -->
    <q-tab-panels v-model="tab" animated class="full-height bg-red">
      <q-tab-panel name="remote" class="">
        <div class="text-h6">Remote</div>
        Remote
      </q-tab-panel>

      <q-tab-panel name="settings">
        <div class="text-h6">Settings</div>
        Settings
      </q-tab-panel>
    </q-tab-panels>

    <q-separator />

    <q-tabs
      v-model="tab"
      dense
      class="bg-grey-3 fixed-bottom"
      align="justify"
      narrow-indicator
    >
      <q-tab name="remote" label="Remote" />
      <q-tab name="settings" label="Settings" />
    </q-tabs>
    <!-- </q-card> -->
  </q-page>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const tab = ref('remote');
    return {
      tab,
    };
  },
});
</script>
