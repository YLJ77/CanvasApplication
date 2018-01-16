var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    repeatRadio = document.getElementById('repeatRadio'),
    noRepeatRadio = document.getElementById('noRepeatRadio'),
    RepeatXRadio = document.getElementById('repeatXRadio'),
    repeatYRadio = document.getElementById('repeatYRadio'),
    image = new Image();

var SHADOW_COLOR = 'rgba(255,0,0,0.7)';


function fillCanvasWithPattern(repeatString) {
    var pattern = context.createPattern(image, repeatString);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = pattern;
    context.fillRect(0, 0, canvas.width, canvas.height);

context.shadowColor = SHADOW_COLOR;
context.shadowOffsetX = 4;
context.shadowOffsetY = 4;
context.shadowBlur = 5;

    context.fill();
}

repeatRadio.onclick = function(e) {
    fillCanvasWithPattern('repeat');
}
repeatXRadio.onclick = function(e) {
    fillCanvasWithPattern('repeat-x');
}
repeatYRadio.onclick = function(e) {
    fillCanvasWithPattern('repeat-y');
}
noRepeatRadio.onclick = function(e) {
    fillCanvasWithPattern('no-repeat');
}

image.src = 'example.jpg';
image.onload = function (e) {
    fillCanvasWithPattern('repeat');
}
