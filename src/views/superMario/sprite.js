import { SpriteSheet } from "./Class/SpriteSheet";
import tiles from '../../assets/img/tiles.png'
import characters from '../../assets/img/characters.gif'
import { loadImage } from "./loaders";

export async function loadMarioSprites(ctx) {
    let image = await loadImage(characters);
    const sprites = new SpriteSheet(image, 16, 16);
    sprites.define('idle', 276, 44, 16, 26);
    return sprites;
}
export async function loadBackgroundSprites(ctx) {
    let image = await loadImage(tiles);
    const sprites = new SpriteSheet(image, 16, 16);
    sprites.defineTile('ground', 0, 0);
    sprites.defineTile('sky', 3, 23);
    return sprites;
}
