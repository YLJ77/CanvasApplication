<template>
    <canvas style="border: 1px solid #ccc;" ref="screen" width="640" height="640"></canvas>
</template>

<script>
    import { loadImg, loadJson } from "./loaders";
    import SpriteSheet from './SpriteSheet'

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
            async drawBackground({ background, ctx, sprites }) {
                const {tile, ranges: [x1,x2,y1,y2]} = background;
                for (let imgXSizeUnit=x1; imgXSizeUnit<x2; imgXSizeUnit++) {
                    for (let imgYSizeUnit=y1; imgYSizeUnit<y2; imgYSizeUnit++) {
                        sprites.drawTile({ name: tile, ctx, imgXSizeUnit, imgYSizeUnit });
                    }
                }
            },
            main() {
                const { ctx } = this;
                loadImg('img/tiles.png').then(async img => {
                    const level = await loadJson({ url: 'levels/1.json' });
                    const sprites = new SpriteSheet({ img, spriteWidth: 16, spriteHeight: 16 });
                    sprites.define({ name: 'ground', imgXSizeUnit: 0, imgYSizeUnit: 0 });
                    sprites.define({ name: 'sky', imgXSizeUnit: 3, imgYSizeUnit: 23 });
                    level.backgrounds.forEach(background => {
                        this.drawBackground({ background, ctx, sprites });
                    });
                });
            }
        },
        mounted() {
            this.initContext();
            this.main();
        }
    }
</script>