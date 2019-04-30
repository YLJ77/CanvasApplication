import { Compositor } from './Compositor'
import { Matrix } from "./math";
import TileCollider from './TileCollider'

export default class Level {
    constructor() {
        this.comp = new Compositor();
        this.entities = new Set();
        this.tiles = new Matrix();
        this.gravity = 2000;

        this.tileCollider = new TileCollider(this.tiles);
    }

    update(deltaTime) {
        this.entities.forEach(entity => {
            entity.update(deltaTime);

            entity.pos.x += entity.vel.x * deltaTime;
            this.tileCollider.check(entity, 'x');
            entity.pos.y += entity.vel.y * deltaTime;
            this.tileCollider.check(entity, 'y');
            entity.vel.y += this.gravity * deltaTime;
        });
    }
}