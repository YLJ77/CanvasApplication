<template>
  <div>
    <canvas id="canvas" width='600' height='600'>Canvas not supported</canvas>
  </div>
</template>

<style scoped lang="scss">
  body {
    background: #ddd;
  }
  #canvas {
    margin: 10px;
    padding: 10px;
    background: #fff;
    border: thin inset #aaa;
  }
</style>

<script>
import { drawGrid, drawAxes } from "../util/appFunc";

export default {
    data() {
        return {
            context: null
        }
    },
    methods: {
        getContext() {
            this.context = document.getElementById('canvas').getContext('2d');
        }
    },
  mounted() {
      this.getContext();
      let { context } = this;
      drawGrid({ context, color: 'lightgray', stepx: 10, stepy: 10 });
      drawAxes({ context });
  }
}
</script>
