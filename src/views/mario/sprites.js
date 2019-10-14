import { loadImg } from "@/views/mario/loaders";
import SpriteSheet from './SpriteSheet'

export function loadBackgroundSprites() {
    return loadImg('img/tiles.png').then(async img => {
        const sprites = new SpriteSheet({ img, spriteWidth: 16, spriteHeight: 16 });
        sprites.defineTile({ name: 'ground', widthTimes: 0, heightTimes: 0 });
        sprites.defineTile({ name: 'sky', widthTimes: 3, heightTimes: 23 });
        return sprites;
    });
}

export function loadMarioSprites() {
    return loadImg('img/characters.gif').then(async img => {
        const sprites = new SpriteSheet({ img, spriteWidth: 16, spriteHeight: 16 });
        sprites.define({ name: 'idle', imgX: 276, imgY: 44, spriteWidth: 16, spriteHeight: 16});
        return sprites;
    });
}
