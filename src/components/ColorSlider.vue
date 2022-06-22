<template>
  <div class="row items-center full-width q-py-md q-px-sm q-pt-lg">
    <!-- style="max-width: 500px" -->
    <div class="col-1 q-mt-sm text-center">
      <q-btn
        rounded
        padding="none"
        icon="las la-angle-left"
        :disable="disabled"
        v-touch-repeat.mouse="countDown"
      />
      <!-- @click="wBVal -= 1" -->
    </div>
    <div class="col-10 q-mt-sm row items-center q-px-xs">
      <!-- style="height: 100px" -->
      <div class="full-width" style="position: relative">
        <div class="" :style="bgStyle"></div>
        <q-slider
          v-model="val"
          :min="min"
          :max="max"
          thumb-size="16px"
          thumb-color="grey-8"
          track-size="0px"
          track-color="transparent"
          color="transparent"
          label-color="grey-6"
          @update:model-value="onChange"
          :label-value="val"
          :disable="disabled"
          label-always
          style="top: -2px; position: absolute"
        />
      </div>
    </div>
    <div class="col-1 q-mt-sm text-center">
      <q-btn
        rounded
        padding="none"
        icon="las la-angle-right"
        :disable="disabled"
        v-touch-repeat.mouse="countUp"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import Convert from 'color-convert';
// type HSL = [H: number, S: number, L: number];
export default defineComponent({
  name: 'ColorSlider',
  props: {
    disabled: { type: Boolean, required: false, default: false },
    fixSaturation: { type: Boolean, required: false, default: true }, // fix saturation or fix luminosity
    initVal: { type: Number, required: true, default: 50 }, // initial slider value
    hue: { type: Number, required: false, default: 50 },
    sat: { type: Number, required: false, default: 100 },
    lum: { type: Number, required: false, default: 50 },
    min: { type: Number, required: false, default: 0 },
    max: { type: Number, required: false, default: 100 },
  },
  emits: ['changed'],
  setup(props, ctx) {
    const val = ref(props.initVal);

    watch(props, (newVal) => {
      val.value = newVal.initVal;
    });

    const countDown = ({ ...newInfo }) => {
      //
      const { repeatCount } = newInfo;
      if (val.value - repeatCount <= props.min) {
        val.value = props.min;
      } else {
        val.value -= repeatCount;
      }
      ctx.emit('changed', val.value);
    };

    const countUp = ({ ...newInfo }) => {
      const { repeatCount } = newInfo;
      if (val.value + repeatCount >= props.max) {
        val.value = props.max;
      } else {
        val.value += repeatCount;
      }
      ctx.emit('changed', val.value);
    };

    const onChange = () => {
      ctx.emit('changed', val.value);
    };

    const hex = computed(() => {
      let minHex = '',
        midHex = '',
        maxHex = '';
      if (props.fixSaturation === true) {
        minHex = '#' + Convert.hsl.hex(props.hue, props.sat, 0);
        midHex = '#' + Convert.hsl.hex(props.hue, props.sat, 50);
        maxHex = '#' + Convert.hsl.hex(props.hue, props.sat, 100);
      } else {
        minHex = '#' + Convert.hsl.hex(props.hue, 0, props.lum);
        midHex = '#' + Convert.hsl.hex(props.hue, 50, props.lum);
        maxHex = '#' + Convert.hsl.hex(props.hue, 100, props.lum);
      }
      return { minHex, midHex, maxHex };
    });

    // background of the slider
    const bgStyle = computed(() => {
      return (
        'height: 20px; \
        width: 100%; \
        background-image: linear-gradient(to right,' +
        hex.value.minHex +
        ',' +
        hex.value.midHex +
        ',' +
        hex.value.maxHex
      );
      (')');
    });

    // onBeforeMount(()=>{
    //   val.value = props.initVal
    // })

    return {
      val,
      bgStyle,
      countDown,
      countUp,
      onChange,
    };
  },
});
</script>
