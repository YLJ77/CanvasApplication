<template>
  <div>
    <canvas
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            id="canvas" width='600' height='600'>Canvas not supported</canvas>
    <ul id='controls'>
      <li>
        <label for="color">颜色</label>
        <select id="color" v-model="color">
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
        <label for="shape">形状</label>
        <select id="shape" v-model="shape" @change="mode='normal'">
        <option value='Circle'>circle</option>
        <option value='Line' selected>line</option>
        <option value='RoundedRect' selected>RoundedRect</option>
        <option value='Polygon' selected>Polygon</option>
        <option value='BezierCurve' selected>BezierCurve</option>
      </select>
      </li>
      <li v-show="shape === 'Polygon'">
        <label for="sides">边数</label>
        <input type="text" id="sides" v-model="sides">
        <label for="startAngle">开始角度</label>
        <input type="text" id="startAngle" v-model="startAngle">
      </li>
      <li>
        <label for="normal-radio">画图</label>
        <input type="radio" id="normal-radio" v-model="mode" value="normal">
        <label for="drag-radio">拖拽</label>
        <input type="radio" id="drag-radio" v-model="mode" value="drag">
        <template v-if="shape === 'BezierCurve'">
          <label for="edit-radio">编辑</label>
          <input type="radio" id="edit-radio" v-model="mode" value="edit">
        </template>
        <label for="rotate-radio">旋转</label>
        <input type="radio" id="rotate-radio" v-model="mode" value="rotate">
        <label for="guidewireCheckbox">导线</label>
        <input id='guidewireCheckbox' v-model="guidewires" type='checkbox' checked/>
        <label for="checkbox">填充:</label>
        <input type="checkbox" id="checkbox" v-model="isFillColor">
        <input @click="erase" id='eraseAllButton' type='button' value='擦除所有'/>
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
      display: flex;
      align-items: center;
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
  }
</style>

<script>
import { drawGuidewires, drawGrid, windowToCanvas, saveDrawingSurface, restoreDrawingSurface } from "../util/appFunc";
import { Circle, RoundRect, Polygon, Line, BezierCurve } from "../util/shape";
import { Protractor } from '../util/Protractor'

export default {
    data() {
        return {
            shapes: [],
            sides: 3,
            startAngle: 0,
            shape: 'Line',
            isFillColor: false,
            ctx: null,
            canvas: null,
            guidewires: true,
            color: 'cornflowerblue',
            rubberbandLine: {
                drawingSurfaceImageData: null,
                mousedown: {},  // x,y
                rubberbandRect: {}, // width, height, left, top
                dragging: false,
            },
            mode: 'normal',
            selectedShape: null,
            draggingPoint: false, // End- or control point user is dragging
            endPoints: [ {}, {} ], // Endpoint locations (x, y)
            controlPoints: [ {}, {} ], // Control point locations (x, y)
            rotatingLockEngaged: false,
            rotatingLockAngle: 0,
            rotatingShape: null,
            protractor: null
        }
    },
    mounted() {
        this.getContext();
        this.drawRubberbandLines();
        // this.test();
    },
    watch: {
        mode() {
            let { canvas, mode } = this;
            switch (mode) {
                case 'drag':
                case 'edit':
                case 'rotate':
                    canvas.style.cursor = 'pointer';
                    break;
                case 'normal':
                    canvas.style.cursor = 'crosshair';
                    break;

            }
        }
    },
    methods: {
        test() {
            let { ctx, canvas, rotatingLockAngle } = this;
            let polygon = {
                x: canvas.width/2,
                y: canvas.height/2,
                radius: 80
            };
            let loc = {
                x: 100,
                y: 100
            };
            let protractor = new Protractor({ ctx, polygon, loc, rotatingLockAngle });
            protractor.draw();
        },
        stopRotatingShape(loc) {
            let { selectedShape, rotatingLockAngle } = this;
            let angle = Math.atan((loc.y - selectedShape.y) /
                (loc.x - selectedShape.x))
                - rotatingLockAngle;

            selectedShape.startAngle += angle;

            this.selectedShape = undefined;
            this.rotatingLockEngaged = false;
            this.rotatingLockAngle = 0;
        },
        saveCanvasInfo(loc) {
            let { rubberbandLine: { mousedown }, rubberbandLine, ctx, canvas, mode } = this;
                rubberbandLine.drawingSurfaceImageData = saveDrawingSurface({ ctx, canvas });
                mousedown.x = loc.x;
                mousedown.y = loc.y;
/*                switch (mode) {
                    case 'drag':
                    case 'edit':
                    case 'normal':
                        rubberbandLine.dragging = true;
                        break;
                }*/
            rubberbandLine.dragging = true;
        },
        drawShapes() {
            let { shapes } = this;
                shapes.forEach( shape => {
                   shape.draw();
            });
        },
        drawBezierCurve() {
            this.updateEndAndControlPoints();
            let { ctx, shapes, rubberbandLine: { dragging }, color, endPoints, controlPoints } = this;
            let curve = new BezierCurve({ ctx, strokeStyle: color, fillStyle: color, endPoints, controlPoints });
            curve.draw();
            if (!dragging) shapes.push(curve);
        },
        updateEndAndControlPoints() {
            let { endPoints, controlPoints, rubberbandLine: { rubberbandRect } } = this;
            endPoints[0].x = rubberbandRect.left;
            endPoints[0].y = rubberbandRect.top;
            endPoints[1].x = rubberbandRect.left + rubberbandRect.width;
            endPoints[1].y = rubberbandRect.top + rubberbandRect.height;
            controlPoints[0].x = rubberbandRect.left;
            controlPoints[0].y = rubberbandRect.top + rubberbandRect.height;
            controlPoints[1].x = rubberbandRect.left + rubberbandRect.width;
            controlPoints[1].y = rubberbandRect.top;
        },
        drawPolygon() {
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
                ctx,
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
                ctx
            });
            polygon.draw();
            if (!dragging) shapes.push(polygon);
        },
        getContext() {
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
        },
        erase() {
            let { ctx, canvas } = this;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGrid({ ctx, color: 'lightgray', stepx: 10, stepy: 10 });
            saveDrawingSurface({ ctx, canvas });
        },
        drawRubberbandLines() {
            let { ctx, color } = this;
            ctx.strokeStyle = color;
            drawGrid({ ctx, color: 'lightgray', stepx: 10, stepy: 10 });
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
                ctx,
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
                ctx,
                filled: isFillColor,
                strokeStyle: color,
                fillStyle: color,
                width,
                height,
                cornerX,
                cornerY,
                cornerRadius
            });
            roundRect.draw();
            if (!dragging) shapes.push(roundRect);
        },
        drawCircle({ loc }) {
            let {
                ctx,
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
            let circle = new Circle({ centerX: x, centerY: y, radius, ctx, filled: isFillColor, strokeStyle: color, fillStyle: color });
            circle.draw();
            if (!dragging) shapes.push(circle);
        },
        drawLine({ loc }) {
            let {
                ctx,
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
            let line = new Line({ ctx, strokeStyle: color, beginX, beginY, endX, endY, filled: false });
            line.draw();
            if (!dragging) shapes.push(line);
        },
        updateRubberband({ loc }) {
            this.updateRubberbandRectangle({ loc });
            this.drawRubberbandShape({ loc });
        },
        getSelectedShape({ loc }) {
            let { shapes, ctx, mode } = this;
            for (let shape of shapes) {
                switch (mode) {
                    case 'drag':
                    case 'rotate':
                        shape.createPath();
                        break;
                    case 'edit':
                        shape.createEditPath();
                }
                if (ctx.isPointInPath(loc.x, loc.y)) {
                    this.selectedShape = shape;
                    switch (mode) {
                        case 'edit':
                            shape.getDraggingPoint(loc);
                            shape.savePointOffset(loc);
                            break;
                        case 'drag':
                            shape.savePointOffset(loc);
                            break;
                    }
                    break;
                }
            }
        },
        initProtractor(loc) {
            let { ctx, rotatingLockAngle, rotatingLockEngaged } = this;
            if (this.selectedShape) {
                this.stopRotatingShape(loc);
                this.redraw();
            }
            this.getSelectedShape({ loc });
            let { selectedShape } = this;
            if (this.selectedShape) {
                let protractor = new Protractor({ ctx, shape: selectedShape, loc, rotatingLockAngle });
                protractor.draw();

                if (!rotatingLockEngaged) {
                    this.rotatingLockEngaged = true;
                    this.rotatingLockAngle = Math.atan((loc.y - selectedShape.y) /
                        (loc.x - selectedShape.x));
                }
                this.protractor = protractor;
            }
        },
        rotateShape(loc) {
            let { rotatingLockEngaged, selectedShape, rotatingLockAngle, protractor } = this;
            this.rotatingShape = Object.assign( Object.create( Object.getPrototypeOf(selectedShape)), selectedShape);
            let {rotatingShape } = this;
            if (rotatingLockEngaged) {
               let angle = Math.atan((loc.y - rotatingShape.y) /
                    (loc.x - rotatingShape.x))
                console.log(`angle: ${ 180/Math.PI * angle }`)
/*                console.log(`rotatingLockAngle: ${ 180/Math.PI * rotatingLockAngle }`)
                console.log(`result: ${ 180/Math.PI * (angle - rotatingLockAngle) }`)*/
                this.redraw();
                // drawPolygon(rotatingShape, angle);
                // drawRotationAnnotations(loc);
                rotatingShape.rotate(angle - rotatingLockAngle);
                protractor.loc = loc;
                protractor.draw();

            }
        },
        onMouseDown(e) {
            let {
                canvas,
                mode,
            } = this;
            let { clientX: x, clientY: y } = e;
            let loc = windowToCanvas({ x, y, canvas });
            e.preventDefault(); // Prevent cursor change
            this.saveCanvasInfo(loc);
            switch (mode) {
                case 'drag':
                    this.getSelectedShape({ loc });
                    break;
                case 'edit':
                    this.getSelectedShape({ loc });
                    break;
                case 'rotate':
                    this.initProtractor(loc);
                    break;
            }
        },
        onMouseMove(e) {
            let {
                canvas,
                ctx,
                guidewires,
                shape,
                rubberbandLine: {
                    mousedown,
                    dragging,
                    drawingSurfaceImageData
                },
                mode,
                selectedShape,
            } = this;
            let { clientX: x, clientY: y } = e;
            e.preventDefault(); // Prevent selections
            let loc = windowToCanvas({ x, y, canvas });
            if (dragging) {
                switch (mode) {
                    case 'drag':
                        selectedShape && selectedShape.updatePoints(loc);
                        break;
                    case 'edit':
                        selectedShape && selectedShape.updateDraggingPoint(loc);
                        break;
                    case 'normal':
                        restoreDrawingSurface({ ctx, imgData: drawingSurfaceImageData });
                        this.updateRubberband({ loc });
                        if(guidewires) {
                            let pos = shape === 'Line' ? loc : mousedown;
                            drawGuidewires({ ctx, x: pos.x, y: pos.y });
                        }
                        break;
                }
                if (mode === 'drag' || mode === 'edit') {
                    this.redraw();
                }
            }
            if (mode === 'rotate') {
                selectedShape && this.rotateShape(loc);
            }
        },
        onMouseUp(e) {
            let {
                ctx,
                canvas,
                rubberbandLine,
                rubberbandLine: {
                    drawingSurfaceImageData
                },
                mode
            } = this;
            let { clientX: x, clientY: y } = e;
            let loc = windowToCanvas({ x, y, canvas });
            rubberbandLine.dragging = false;
            if (mode === 'normal') {
                restoreDrawingSurface({ ctx, imgData: drawingSurfaceImageData });
                this.updateRubberband({ loc });
            }
        },
        redraw() {
            let { ctx, canvas } = this;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGrid({ ctx, color: 'lightgray', stepx: 10, stepy: 10 });
            this.drawShapes();
        }
    },
}
</script>
