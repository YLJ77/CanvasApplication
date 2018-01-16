function draw() {
    let canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        
    }
}


function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height -radius);
}
