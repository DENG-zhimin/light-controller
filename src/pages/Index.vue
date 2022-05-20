<template>
  <q-page class="row q-pa-none">
    <!-- <q-card> -->
    <q-tab-panels v-model="tab" class="col-12">
      <q-tab-panel name="panel" class="q-pa-none">
        <!-- <div class="text-h6">Panel</div>
        Panel -->
        <panel-page />
      </q-tab-panel>

      <q-tab-panel name="settings">
        <settings-page />
      </q-tab-panel>
    </q-tab-panels>

    <!-- <q-separator /> -->

    <q-tabs
      v-model="tab"
      dense
      align="justify"
      indicator-color="transparent"
      active-class="bg-grey-5 "
      class="bg-grey-2 fixed-bottom text-grey-8"
    >
      <!-- narrow-indicator -->
      <q-tab name="panel" icon="las la-sun" label="panel" />
      <q-tab name="settings" icon="las la-cog" label="Settings" />
    </q-tabs>
    <!-- </q-card> -->
  </q-page>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import PanelPage from './Panel.vue';
import SettingsPage from './Settings.vue';

export default defineComponent({
  name: 'IndexPage',
  components: {
    PanelPage,
    SettingsPage,
  },
  setup() {
    const tab = ref('panel');
    return {
      tab,
    };
  },
});
</script>
