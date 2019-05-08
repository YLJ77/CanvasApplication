import TileResolver from './TileResolver'
export default class TileCollider {
    constructor(tileMatrix) {
        this.tiles = new TileResolver(tileMatrix);
    }

    check(entity, dir) {
        let x, y, matches;
        if (dir === 'x') {
            if (entity.vel.x > 0) {
                x = entity.pos.x + entity.size.x;
            } else if (entity.vel.x < 0) {
                x = entity.pos.x
            } else {
                return;
            }
            matches = this.tiles.searchByRange(
                x, x,
                entity.pos.y, entity.pos.y + entity.size.y
            );
        } else if (dir === 'y') {
            if (entity.vel.y > 0) {
                y = entity.pos.y + entity.size.y;
            } else if (entity.vel.y < 0) {
                y = entity.pos.y
            } else {
                return;
            }
            matches = this.tiles.searchByRange(
                entity.pos.x, entity.pos.x + entity.size.x,
                y, y
            );
        }

        matches.forEach(match => {
            if (match.tile.type !== 'ground') return;

            if (entity.vel[dir] > 0) {
                if (entity.pos[dir] + entity.size[dir] > match[`${dir}1`]) {
                    entity.pos[dir] = match[`${dir}1`] - entity.size[dir];
                    entity.vel[dir] = 0;

                    entity.obstruct('bottom');
                }
            } else if (entity.vel[dir] < 0) {
                if (entity.pos[dir] < match[`${dir}2`]) {
                    entity.pos[dir] = match[`${dir}2`];
                    entity.vel[dir] = 0;
                }
            }
        });
    }

    test(entity) {
        this.check(entity, 'y');
        this.check(entity, 'x');
/*        const match = this.tiles.searchByPosition(entity.pos.x, entity.pos.y);
        if (match) {
            console.log('Matched tile', match, match.tile);
        }*/
    }
}