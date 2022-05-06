<template>
  <div class="column q-gutter-y-sm bg-white "
    v-if="bleSrvs.length > 0">
    <div class="col column  "
      v-for="(srv, index) in bleSrvs" :key="index">
      <div class="col shadow-1 q-pa-sm">
        <div>
        {{ 'uuid: ' +  srv.uuid }}
        </div>
        <div>
          {{ 'characteristics: '}}
          <div class="col q-ml-md shadow-1 q-mb-md" v-for="(chr, index) in srv.characteristics" :key="index"  >
            <div v-for="(c, key) in chr" :key="key">
              <div v-if="typeof c === 'object'">
                {{key}} :
                <div v-for="(val, k) in c" :key="k"  class="q-ml-md">
                  {{ k }} : {{val}}
                </div>
              </div>
              <div v-else>
                {{key}} :  {{c}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>未发现服务</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BleSrvsPage',
  props:[
    'bleSrvs'
  ],
  setup() {
    return {
    }
  },
})
</script>
