<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-grey-7">
        <!-- <q-toolbar-title></q-toolbar-title> -->
        <div @click.stop="goHome">
          <img src="~assets/logo.png" alt="AOI" style="width: 80px" />
        </div>
        <q-space></q-space>
        <div class="row justify-center text-bold q-mr-lg">
          Flashlight Controller
        </div>
        <q-space></q-space>
        <div>
          <q-btn
            flat
            round
            size="md"
            v-if="currDev.deviceId"
            color="blue"
            icon="lab la-bluetooth-b"
            @click="getDev"
          />
          <q-btn
            flat
            round
            size="md"
            v-else
            color="grey-2"
            icon="lab la-bluetooth-b"
            @click="getDev"
          />
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
import { defineComponent, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useFlashStore } from 'src/stores/flashlight';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const goHome = () => {
      router.push('/');
    };
    const FlashStore = useFlashStore();
    const { currDev, saveFlag } = storeToRefs(FlashStore);

    const getDev = () => {
      if (saveFlag.value === false) {
        $q.dialog({
          dark: true,
          title: 'Confirm',
          message: 'Data changed! Leave without SAVE?',
          persistent: true,
          cancel: true,
        })
          .onOk(() => {
            console.log('OK');
            router.push('/bledev');
          })
          .onCancel(() => {
            console.log('cancelled');
          });
      } else {
        router.push('/bledev');
      }
    };

    onBeforeMount(() => {
      // console.log('quasar', $q);
    });

    return { goHome, currDev, getDev };
  },
});
</script>
