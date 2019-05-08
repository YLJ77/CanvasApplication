import Keyboard from './Class/KeyBoardState'

export function setupKeyboard(entity) {
    const SPACE = 'KeyP';
    const RIGHT = 'KeyD';
    const LEFT = 'KeyA';
    const input = new Keyboard();
    input.addMapping(SPACE, keyState => {
        if (keyState) {
            entity.jump.start();
        } else {
            entity.jump.cancel();
        }
    });
    input.addMapping(RIGHT, keyState => {
        entity.go.dir += keyState ? 1 : -1;
    });
    input.addMapping(LEFT, keyState => {
        entity.go.dir += -keyState ? -1 : 1;
    });
    return input;
}