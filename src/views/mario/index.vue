<template>
    <canvas style="border: 1px solid #ccc;" ref="screen" width="640" height="640"></canvas>
</template>

<script>
    import { loadLevel } from "./loaders";
    import { loadBackgroundSprites, loadMarioSprites } from "@/views/mario/sprites";
    import { createBackgroundLayer, createSpriteLayer } from "@/views/mario/layers";
    import Compositor from './Compositor'
    import Entity from './Entity'
    import Timer from './Timer'

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
                ]).then(([backgroundSprites, marioSprites, level]) => {
                    const gravity = 30;
                    const mario = new Entity({ sprite: marioSprites.tiles.get('idle') });
                    const comp = new Compositor();
                    const backgroundLayer = createBackgroundLayer({ backgrounds: level.backgrounds, sprites: backgroundSprites })
                    const spriteLayer = createSpriteLayer({ entity: mario});
                    comp.layers.push(
                        backgroundLayer,
                        spriteLayer);
                    mario.pos.set(64, 180);
                    mario.vel.set(200, -600);
                    const timer = new Timer({
                        update: deltaTime => {
                            comp.draw(ctx);
                            mario.update({ deltaTime });
                            mario.vel.y += gravity;
                        }
                    });
                    timer.start();
                });
            }
        },
        mounted() {
            this.initContext();
            this.main();
        }
    }
</script>