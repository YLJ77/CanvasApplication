<template>
    <div>
        <canvas id="screen" width="640" height="640">canvas not supported</canvas>
    </div>
</template>

<style lang="scss" scoped>
    canvas {
        border: 1px solid #ccc;
    }
</style>

<script>
    import { loadLevel } from "./loaders";
    import Timer from './Timer'
    import { createMario } from "./Class/entities";
    import { createCollisionLayer, createCameraLayer } from "./layers";
    import { setupKeyboard } from "./input";
    import Camera from './Class/Camera'
    import { setupMouseControl } from "./debugger";

    export default {
        data() {
            return {
                canvas: null,
                ctx: null
            }
        },
        methods: {
            async draw() {
                let { ctx, canvas } = this;
                const camera = new Camera();
                const mario = await createMario(ctx);
                const level = await loadLevel('1-1', ctx);
                window.camera = camera;
                mario.pos.set(14, 64);
                level.entities.add(mario);
                level.comp.layers.push(
                    createCollisionLayer(level),
                    createCameraLayer(camera)
                );

                const input = setupKeyboard(mario);
                input.listenTo(window);

                setupMouseControl(canvas, mario, camera);
                const timer = new Timer(1/60);
                timer.update = function update(deltaTime) {
                    // mario.update(deltaTime);
                    level.update(deltaTime);
                    level.comp.draw(ctx, camera);
                };
                timer.start();
            },
            init() {
                this.canvas = document.getElementById('screen');
                this.ctx = this.canvas.getContext('2d');
            }
        },
        mounted() {
            this.init();
            this.draw();

        }
    }
</script>