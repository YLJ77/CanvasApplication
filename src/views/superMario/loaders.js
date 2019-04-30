import Level from './Class/Level'
import { createBackgroundLayer, createSpriteLayer } from "./layers";
import { loadBackgroundSprites } from "./sprite";

export function loadImage(src) {
    return new Promise(resolve => {
        let image = new Image();
        image.src = src;
        image.onload = () => {
            resolve(image);
        }
    });
}

function createTiles(level, backgrounds) {
    backgrounds.forEach(background => {
        background.ranges.forEach(([x1, x2, y1, y2]) => {
            for(let x=x1; x<x2; ++x) {
                for (let y=y1; y<y2; ++y) {
                    level.tiles.set(x, y, {
                        name: background.tile
                    });
                }
            }
        })
    });
}

export function loadLevel(name, ctx) {
    return fetch(`/levels/${name}.json`)
        .then(r => r.json())
        .then(async levelSpec => {
            const level = new Level();
            createTiles(level, levelSpec.backgrounds);
            let backgroundSprite = await loadBackgroundSprites(ctx);
            const backgroundLayer = createBackgroundLayer(level, backgroundSprite);
            level.comp.layers.push(backgroundLayer);
            const spriteLayer = createSpriteLayer(level.entities);
            level.comp.layers.push(spriteLayer);
            return level;
        });
}
