import { Vec2 } from "./math";

export class Entity {
    constructor() {
        this.pos = new Vec2(0, 0);
        this.vel = new Vec2(0, 0);
    }
}