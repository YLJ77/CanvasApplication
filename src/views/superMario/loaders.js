import Level from './Class/Level'
import { createBackgroundLayer, createSpriteLayer } from "./layers";
import {SpriteSheet} from "./Class/SpriteSheet";
import {createAnim} from "./anim";

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
    function applyRange(background, xStart, xLen, yStart, yLen) {
        const xEnd = xStart + xLen;
        const yEnd = yStart + yLen;

        for(let x=xStart; x<xEnd; ++x) {
            for (let y=yStart; y<yEnd; ++y) {
                level.tiles.set(x, y, {
                    name: background.tile,
                    type: background.type
                });
            }
        }
    }

    backgrounds.forEach(background => {
        background.ranges.forEach(range => {
            if (range.length === 4) {
                const [xStart, xLen, yStart, yLen] = range;
                applyRange(background, xStart, xLen, yStart, yLen)
            } else if (range.length === 3){
                const [xStart, xLen, yStart] = range;
                applyRange(background, xStart, xLen, yStart, 1);
            } else if (range.length === 2) {
                const [xStart, yStart] = range;
                applyRange(background, xStart, 1, yStart, 1);
            }
        })
    });
}

async function loadJson(url) {
    return new Promise(resolve => {
        fetch(url).then(r => {
            resolve(r.json());
        });
    });
}

export async function loadSpriteSheet(name) {
    let sheetSpec = await loadJson(`sprites/${name}.json`)
    let image = await loadImage(sheetSpec.imageUrl);
    const sprites = new SpriteSheet(
        image,
        sheetSpec.tileW,
        sheetSpec.tileH,
    );

    if (sheetSpec.tiles) {
        sheetSpec.tiles.forEach(tileSpec => {
            sprites.defineTile(
                tileSpec.name,
                tileSpec.index[0],
                tileSpec.index[1]
            )
        });
    }

    if (sheetSpec.frames) {
        sheetSpec.frames.forEach(frameSpec => {
            sprites.define(frameSpec.name, ...frameSpec.rect);
        });
    }

    if (sheetSpec.animations) {
        sheetSpec.animations.forEach(animSpec => {
            const animation = createAnim(animSpec.frames, animSpec.frameLen)
            sprites.defineAnim(animSpec.name, animation);
        });
    }
    return sprites;
}

export async function loadLevel(name, ctx) {
    let levelSpec = await loadJson(`levels/${name}.json`)
    const level = new Level();
    createTiles(level, levelSpec.backgrounds);
    let backgroundSprite = await loadSpriteSheet(levelSpec.spriteSheet);
    const backgroundLayer = createBackgroundLayer(level, backgroundSprite);
    level.comp.layers.push(backgroundLayer);
    const spriteLayer = createSpriteLayer(level.entities);
    level.comp.layers.push(spriteLayer);
    return level;
}
