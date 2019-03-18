<template>
  <div>
    <canvas
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            id="canvas" width='600' height='600'>Canvas not supported</canvas>
    <ul id='controls'>
      <li>
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
      </li>
      <li>
        shape: <select v-model="shape" @change="editing=false">
        <option value='Circle'>circle</option>
        <option value='Line' selected>line</option>
        <option value='RoundedRect' selected>RoundedRect</option>
        <option value='Polygon' selected>Polygon</option>
      </select>
      </li>
      <li v-show="shape === 'Polygon'">
        <label for="sides">sides</label>
        <input type="text" id="sides" v-model="sides">
        <label for="startAngle">startAngle</label>
        <input type="text" id="startAngle" v-model="startAngle">
      </li>
      <li>
        <label for="edit-checkbox">编辑:</label>
        <input type="checkbox" id="edit-checkbox" v-model="editing">
        <label for="guidewireCheckbox">Guidewires:</label>
        <input id='guidewireCheckbox' v-model="guidewires" type='checkbox' checked/>
        <label for="checkbox">填充:</label>
        <input type="checkbox" id="checkbox" v-model="isFillColor">
        <input @click="erase" id='eraseAllButton' type='button' value='Erase all'/>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
  body {
    background: #eeeeee;
  }
  #controls {
    position: absolute;
    left: -25px;
    top: 0;
      display: flex;
      flex-wrap: wrap;
    list-style: none;
    align-items: center;
    li {
      margin-right: 10px;
    }
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
import { drawGuidewires, drawGrid, windowToCanvas, saveDrawingSurface, restoreDrawingSurface } from "../util/appFunc";
import { Circle, RoundRect, Polygon, Line } from "../util/shape";

export default {
    data() {
        return {
            shapes: [],
            sides: 3,
            startAngle: 0,
            shape: 'Line',
            isFillColor: false,
            context: null,
            canvas: null,
            guidewires: true,
            color: 'cornflowerblue',
            rubberbandLine: {
                drawingSurfaceImageData: null,
                mousedown: {},  // x,y
                rubberbandRect: {}, // width, height, left, top
                dragging: false,
            },
            draggingOffsetX: null,
            draggingOffsetY: null,
            draggingOffsetEndX: null,
            draggingOffsetEndY: null,
            editing: false,
            selectedShape: null
        }
    },
    mounted() {
        this.getContext();
        this.drawRubberbandLines();
        window.shapes = this.shapes;
    },
    watch: {
        editing() {
            this.editing ? this.startEditing() : this.stopEditing();
        }
    },
    methods: {
        startDragging(loc) {
            let { rubberbandLine: { mousedown }, rubberbandLine, context } = this;
                rubberbandLine.drawingSurfaceImageData = saveDrawingSurface({ context, canvas });
                mousedown.x = loc.x;
                mousedown.y = loc.y;
                rubberbandLine.dragging = true;
        },
        startEditing() {
            let { canvas } = this;
            canvas.style.cursor = 'pointer';
            this.editing = true;
        },
        stopEditing() {
            let { canvas } = this;
            canvas.style.cursor = 'crosshair';
            this.editing = false;
        },
        drawShapes() {
            let { shapes } = this;
                shapes.forEach( shape => {
                   shape.stroke();
                   shape.filled && shape.fill();
            });
        },
        drawPolygon({ loc }) {
            let {
                rubberbandLine: {
                    dragging,
                    rubberbandRect: {
                        width
                    },
                    mousedown: {
                        x,
                        y
                    }
                },
                context,
                sides,
                startAngle,
                isFillColor,
                color,
                shapes
            } = this;
            let polygon = new Polygon({
                centerX: x,
                centerY: y,
                radius: width,
                sides,
                startAngle,
                strokeStyle: color,
                fillStyle: color,
                filled: isFillColor,
                context
            });
            context.beginPath();
            polygon.stroke();
            if (isFillColor) {
                polygon.fill();
            }
            if (!dragging) shapes.push(polygon);
        },
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
            let { shape } = this;
            this[`draw${ shape }`]({ loc });
        },
        drawRoundedRect({ cornerRadius = 10 } = {}) {
            let {
                context,
                color,
                isFillColor,
                shapes,
                rubberbandLine: {
                    dragging,
                    rubberbandRect: { width, height },
                    mousedown: { x: cornerX, y: cornerY }
                },
            } = this;
            let roundRect = new RoundRect({
                context,
                filled: isFillColor,
                strokeStyle: color,
                fillStyle: color,
                width,
                height,
                cornerX,
                cornerY,
                cornerRadius
            });
            roundRect.stroke();
            if (isFillColor) roundRect.fill();
            if (!dragging) shapes.push(roundRect);
        },
        drawCircle({ loc }) {
            let {
                context,
                rubberbandLine: {
                    dragging,
                    rubberbandRect: { width, height },
                    mousedown: {
                        x,
                        y
                    }
                },
                color,
                isFillColor,
                shapes
            } = this;
            let radius;
            if (y === loc.y) {
                radius = Math.abs(loc.x - x);
            } else {
                radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
            }
            let circle = new Circle({ centerX: x, centerY: y, radius, context, filled: isFillColor, strokeStyle: color, fillStyle: color })
            circle.stroke();
            if (isFillColor) circle.fill();
            if (!dragging) shapes.push(circle);
        },
        drawLine({ loc }) {
            let {
                context,
                rubberbandLine: {
                    mousedown: {
                        x: beginX,
                        y: beginY
                    },
                    dragging
                },
                color,
                shapes
            } = this;
            let { x: endX, y: endY } = loc;
            let line = new Line({ context, strokeStyle: color, beginX, beginY, endX, endY, filled: false })
            line.stroke();
            if (!dragging) shapes.push(line);
        },
        updateRubberband({ loc }) {
            this.updateRubberbandRectangle({ loc });
            this.drawRubberbandShape({ loc });
        },
        onMouseDown(e) {
            let {
                context,
                canvas,
                editing,
                shapes
            } = this;
            let { clientX: x, clientY: y } = e;
            let loc = windowToCanvas({ x, y, canvas });
            e.preventDefault(); // Prevent cursor change
            if (editing) {
                for (let shape of shapes) {
                    shape.createPath();
                    if (context.isPointInPath(loc.x, loc.y)) {
                        this.startDragging(loc);
                        this.selectedShape = shape;
                        this.draggingOffsetX = loc.x - shape.x;
                        this.draggingOffsetY = loc.y - shape.y;
                        if (this.selectedShape.type === 'Line') {
                            this.draggingOffsetEndX = loc.x - shape.endX;
                            this.draggingOffsetEndY = loc.y - shape.endY;
                        }
                        break;
                    }
                }
            } else {
                this.startDragging(loc);
            }
        },
        onMouseMove(e) {
            let {
                canvas,
                context,
                guidewires,
                shape,
                rubberbandLine: {
                    mousedown,
                    dragging,
                    drawingSurfaceImageData
                },
                editing,
                selectedShape,
                draggingOffsetX,
                draggingOffsetY,
                draggingOffsetEndX,
                draggingOffsetEndY
            } = this;
            let { clientX: x, clientY: y } = e;
            e.preventDefault(); // Prevent selections
            let loc = windowToCanvas({ x, y, canvas });
            if (editing && dragging) {
                selectedShape.x = loc.x - draggingOffsetX;
                selectedShape.y = loc.y - draggingOffsetY;
                if (selectedShape.type === 'Line') {
                    selectedShape.endX = loc.x - draggingOffsetEndX;
                    selectedShape.endY = loc.y - draggingOffsetEndY;
                }
                context.clearRect(0, 0, canvas.width, canvas.height);
                drawGrid({ context, color: 'lightgray', stepx: 10, stepy: 10 });
                this.drawShapes();
            }
            else {
                if (dragging) {
                    restoreDrawingSurface({ context, imgData: drawingSurfaceImageData });
                    this.updateRubberband({ loc });
                    if(guidewires) {
                        let pos = shape === 'Line' ? loc : mousedown;
                        drawGuidewires({ context, x: pos.x, y: pos.y });
                    }
                }
            }
        },
        onMouseUp(e) {
            let {
                context,
                canvas,
                rubberbandLine,
                rubberbandLine: {
                    drawingSurfaceImageData
                },
                editing
            } = this;
            let { clientX: x, clientY: y } = e;
            let loc = windowToCanvas({ x, y, canvas });
            rubberbandLine.dragging = false;
            if (!editing) {
            restoreDrawingSurface({ context, imgData: drawingSurfaceImageData });
            this.updateRubberband({ loc });
            }
        }
    },
}
</script>
