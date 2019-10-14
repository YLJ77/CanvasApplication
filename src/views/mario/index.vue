<template>
    <canvas style="border: 1px solid #ccc;" ref="screen" width="640" height="640"></canvas>
</template>

<script>
    import { loadLevel } from "./loaders";
    import { loadBackgroundSprites, loadMarioSprites } from "@/views/mario/sprites";
    import { createBackgroundLayer, createSpriteLayer } from "@/views/mario/layers";
    import Compositor from './Compositor'

    export default {
        data() {
            return {
                ctx: null
            }
        },
        methods: {
            initContext() {
                this.ctx = this.$refs.screen.getContext('2d');
            },
            main() {
                const { ctx } = this;
                Promise.all([
                    loadBackgroundSprites(),
                    loadMarioSprites(),
                    loadLevel({ url: 'levels/1.json' })
                ]).then(([backgroundSprite, marioSprite, level]) => {
                    const pos = {
                        x: 64,
                        y: 64
                    };
                    const comp = new Compositor();
                    const backgroundLayer = createBackgroundLayer({ backgrounds: level.backgrounds, sprites: backgroundSprite })
                    const spriteLayer = createSpriteLayer({ sprite: marioSprite, pos });
                    comp.layers.push(backgroundLayer, spriteLayer);

                    function update() {
                        comp.draw(ctx);
                        pos.x +=2;
                        pos.y += 2;
                        requestAnimationFrame(update);
                    }
                    update();
                });
            }
        },
        mounted() {
            this.initContext();
            this.main();
        }
    }
</script>