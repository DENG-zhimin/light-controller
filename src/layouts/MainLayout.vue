<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-grey-7">
        <!-- <q-toolbar-title></q-toolbar-title> -->
        <!-- <q-avatar square> -->
        <img src="~assets/logo.png" alt="AOI" style="width: 80px" />
        <!-- </q-avatar> -->
        <q-space></q-space>
        <div class="row justify-center text-bold q-mr-lg">
          Flashlight Controller
        </div>
        <q-space></q-space>
        <div>
          <q-avatar />
        </div>
      </q-toolbar>
    </q-header>

    <!-- <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    return {};
  },
});
</script>
