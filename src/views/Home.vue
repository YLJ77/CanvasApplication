<template>
  <div>
    <canvas
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            id="canvas" width='600' height='600'>Canvas not supported</canvas>
    <div id='controls'>
      Stroke color: <select v-model="color">
      <option value='red'>red</option>
      <option value='green'>green</option>
      <option value='blue'>blue</option>
      <option value='orange'>orange</option>
      <option value='cornflowerblue' selected>cornflowerblue</option>
      <option value='goldenrod'>goldenrod</option>
      <option value='navy'>navy</option>
      <option value='purple'>purple</option>
    </select>
      Guidewires:
      <input id='guidewireCheckbox' v-model="guidewires" type='checkbox' checked/>
      填充：
      <input v-model="isFillColor" type='checkbox'/>
      <input @click="erase" id='eraseAllButton' type='button' value='Erase all'/>
    </div>
  </div>
</template>

<style scoped lang="scss">
  body {
    background: #eeeeee;
  }
  #controls {
    position: absolute;
    left: 25px;
    top: 25px;
  }
  #canvas {
    background: #ffffff;
    cursor: pointer;
    margin-left: 10px;
    margin-top: 10px;
    -webkit-box-shadow: 4px 4px 8px rgba(0,0,0,0.5);
    -moz-box-shadow: 4px 4px 8px rgba(0,0,0,0.5);
    -box-shadow: 4px 4px 8px rgba(0,0,0,0.5);
  }
</style>

<script>
import { drawGrid, drawAxes, windowToCanvas, saveDrawingSurface, restoreDrawingSurface } from "../util/appFunc";

export default {
    data() {
        return {
            isFillColor: false,
            context: null,
            canvas: null,
            guidewires: true,
            color: 'cornflowerblue',
            rubberbandLine: {
                drawingSurfaceImageData: null,
                mousedown: {},
                rubberbandRect: {},
                dragging: false,
            }
        }
    },
    methods: {
        getContext() {
            this.canvas = document.getElementById('canvas');
            this.context = this.canvas.getContext('2d');
        },
        erase() {
            let { context, canvas } = this;
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawGrid({ context, color: 'lightgray', stepx: 10, stepy: 10 });
            saveDrawingSurface({ context, canvas });
        },
        drawRubberbandLines() {
            let { context, color } = this;
            context.strokeStyle = color;
            drawGrid({ context, color: 'lightgray', stepx: 10, stepy: 10 });
        },
        updateRubberbandRectangle({ loc }) {
            let {
                rubberbandLine: {
                    rubberbandRect,
                    mousedown
                },
            } = this;
            rubberbandRect.width = Math.abs(loc.x - mousedown.x);
            rubberbandRect.height = Math.abs(loc.y - mousedown.y);
            if (loc.x > mousedown.x) rubberbandRect.left = mousedown.x;
            else rubberbandRect.left = loc.x;
            if (loc.y > mousedown.y) rubberbandRect.top = mousedown.y;
            else rubberbandRect.top = loc.y;
        },
        drawRubberbandShape({ loc }) {
            // this.drawCircle({ loc });
            this.drawLine({ loc });
        },
        drawCircle({ loc }) {
            let {
                context,
                guidewires,
                rubberbandLine: {
                    rubberbandRect,
                    mousedown
                },
                color,
                isFillColor
            } = this;
            let angle,
                radius;
            if (mousedown.y === loc.y) {
                radius = Math.abs(loc.x - mousedown.x);
            } else {
                angle = Math.atan(rubberbandRect.height/rubberbandRect.width);
                radius = rubberbandRect.height / Math.sin(angle);
            }
            context.beginPath();
            context.arc(mousedown.x, mousedown.y, radius, 0, Math.PI*2, false);
            context.strokeStyle = color;
            context.stroke();
            if (isFillColor) {
                context.fillStyle = color;
                context.fill();
            }
            if(guidewires) {
                this.drawGuidewires(mousedown);
            }
        },
        drawLine({ loc }) {
            let {
                context,
                guidewires,
                rubberbandLine: {
                    mousedown
                },
                color
            } = this;
            context.strokeStyle = color;
            context.beginPath();
            context.moveTo(mousedown.x, mousedown.y);
            context.lineTo(loc.x, loc.y);
            context.stroke();
            if(guidewires) {
                this.drawGuidewires(loc);
            }
        },
        updateRubberband({ loc }) {
            this.updateRubberbandRectangle({ loc });
            this.drawRubberbandShape({ loc });
        },
        drawHorizontalLine ({ y }) {
            let { context } = this;
            context.beginPath();
            context.moveTo(0,y+0.5);
            context.lineTo(context.canvas.width, y+0.5);
            context.stroke();
        },
        drawVerticalLine ({ x }) {
            let { context } = this;
            context.beginPath();
            context.moveTo(x+0.5,0);
            context.lineTo(x+0.5, context.canvas.height);
            context.stroke();
        },
        drawGuidewires({ x, y }) {
            let { context } = this;
            context.save();
            context.strokeStyle = 'rgba(0,0,230,0.4)';
            context.lineWidth = 0.5;
            this.drawVerticalLine({ x });
            this.drawHorizontalLine({ y });
            context.restore();
        },
        onMouseDown(e) {
            let {
                context,
                canvas,
                rubberbandLine: {
                    mousedown
                },
                rubberbandLine
            } = this;
            let { clientX: x, clientY: y } = e;
            let loc = windowToCanvas({ x, y, canvas });
            e.preventDefault(); // Prevent cursor change
            rubberbandLine.drawingSurfaceImageData = saveDrawingSurface({ context, canvas });
            mousedown.x = loc.x;
            mousedown.y = loc.y;
            rubberbandLine.dragging = true;
        },
        onMouseMove(e) {
            let {
                canvas,
                context,
                rubberbandLine: {
                    dragging,
                    drawingSurfaceImageData
                }
            } = this;
            if (dragging) {
                let { clientX: x, clientY: y } = e;
                e.preventDefault(); // Prevent selections
                let loc = windowToCanvas({ x, y, canvas });
                restoreDrawingSurface({ context, imgData: drawingSurfaceImageData });
                this.updateRubberband({ loc });
            }
        },
        onMouseUp(e) {
            let {
                context,
                canvas,
                rubberbandLine,
                rubberbandLine: {
                    drawingSurfaceImageData
                }
            } = this;
            let { clientX: x, clientY: y } = e;
            let loc = windowToCanvas({ x, y, canvas });
            restoreDrawingSurface({ context, imgData: drawingSurfaceImageData });
            this.updateRubberband({ loc });
            rubberbandLine.dragging = false;
        }
    },
  mounted() {
      this.getContext();
      this.drawRubberbandLines();
      // drawAxes({ context });
  }
}
</script>
