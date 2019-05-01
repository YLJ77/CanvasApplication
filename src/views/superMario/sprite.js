import { SpriteSheet } from "./Class/SpriteSheet";
import { loadImage } from "./loaders";

export async function loadMarioSprites(ctx) {
    let image = await loadImage('/img/characters.gif');
    const sprites = new SpriteSheet(image, 16, 16);
    sprites.define('idle', 276, 44, 16, 26);
    return sprites;
}
