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
        <label for="edit-checkbox">编辑:</label>
        <input type="checkbox" id="edit-checkbox" v-model="editing">
      </li>
      <li>
        Guidewires:
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
import { drawGrid, Point, Polygon, windowToCanvas, saveDrawingSurface, restoreDrawingSurface } from "../util/appFunc";

export default {
    data() {
        return {
            polygons: [],
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
            editing: false,
            selectedPolygon: null
        }
    },
    mounted() {
        this.getContext();
        this.drawRubberbandLines();
        window.polygons = this.polygons;
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
        drawPolygons() {
            let { polygons } = this;
                polygons.forEach( function (polygon) {
                   polygon.stroke();
                   polygon.filled && polygon.fill();
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
                polygons
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
            polygon.createPath();
            polygon.stroke();
            if (isFillColor) {
                polygon.fill();
            }
            if (!dragging) polygons.push(polygon);
        },
        drawCheckbox() {
            let { context } = this;
            context.fillStyle = 'cornflowerblue';
            context.strokeStyle = 'yellow';
            context.shadowColor = 'rgba(50,50,50,1.0)';
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowBlur = 4;
            context.lineWidth = 20;
            context.lineCap = 'round';
            context.beginPath();
            context.moveTo(120.5, 130);
            context.quadraticCurveTo(150.8, 130, 160.6, 150.5);
            context.quadraticCurveTo(190, 250.0, 210.5, 160.5);
            context.quadraticCurveTo(240, 100.5, 290, 70.5);
            context.stroke();
            let points = [120.5, 130, 150.8, 130, 160.6, 150.5, 190, 250.0, 210.5, 160.5, 240, 100.5, 290, 70.5];
            this.drawBatchPoint({ points });
        },
        drawBatchPoint({ points }) {
            points.forEach((x, index) => {
                if ((index < points.length - 1) && (index + 1) % 2 !== 0) {
                    let y = points[index + 1];
                    this.drawPoint({ x, y })
                }
            });
        },
        drawPoint({ x, y, radius = 2 }) {
            let { context } = this;
            context.save();
            context.beginPath();
            context.fillStyle = 'red';
            context.arc(x, y, radius, 0, 2 * Math.PI, false);
            context.fill();
            context.restore();
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
        roundedRect({ cornerRadius }) {
            let { context,
                rubberbandLine: {
                    rubberbandRect: { width, height },
                    mousedown: { x: cornerX, y: cornerY }
                },
            } = this;
            context.moveTo(cornerX + cornerRadius, cornerY);
            context.arcTo(cornerX + width, cornerY,
                cornerX + width, cornerY + height,
                cornerRadius);
            context.arcTo(cornerX + width, cornerY + height,
                cornerX, cornerY + height,
                cornerRadius);
            context.arcTo(cornerX, cornerY + height,
                cornerX, cornerY,
                cornerRadius);
            context.arcTo(cornerX, cornerY,
                cornerX + cornerRadius, cornerY,
                cornerRadius);

        },
        drawRoundedRect({ cornerRadius = 10 } = {}) {
            let { context, color, isFillColor } = this;
            context.beginPath();
            this.roundedRect({ cornerRadius });
            context.strokeStyle = color;
            if (isFillColor) {
                context.fillStyle = color;
                context.fill();
            }
            context.stroke();
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
        },
        drawLine({ loc }) {
            let {
                context,
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
                rubberbandLine,
                editing,
                shape,
                polygons
            } = this;
            let { clientX: x, clientY: y } = e;
            let loc = windowToCanvas({ x, y, canvas });
            e.preventDefault(); // Prevent cursor change
            if (shape === 'Polygon' && editing) {
                for (let polygon of polygons) {
                    polygon.createPath();
                    if (context.isPointInPath(loc.x, loc.y)) {
                        this.startDragging(loc);
                        this.selectedPolygon = polygon;
                        this.draggingOffsetX = loc.x - polygon.x;
                        this.draggingOffsetY = loc.y - polygon.y;
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
                selectedPolygon,
                draggingOffsetX,
                draggingOffsetY
            } = this;
            let { clientX: x, clientY: y } = e;
            e.preventDefault(); // Prevent selections
            let loc = windowToCanvas({ x, y, canvas });
            if (editing && dragging) {
                selectedPolygon.x = loc.x - draggingOffsetX;
                selectedPolygon.y = loc.y - draggingOffsetY;
                context.clearRect(0, 0, canvas.width, canvas.height);
                drawGrid({ context, color: 'lightgray', stepx: 10, stepy: 10 });
                this.drawPolygons();
            }
            else {
                if (dragging) {
                    restoreDrawingSurface({ context, imgData: drawingSurfaceImageData });
                    this.updateRubberband({ loc });
                    if(guidewires) {
                        let pos = shape === 'Line' ? loc : mousedown;
                        this.drawGuidewires(pos);
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
