function draw() {
    let canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        let points;
        let ctx = canvas.getContext('2d');
        let curPoint = [75, 25];
        ctx.beginPath();
        ctx.moveTo(...curPoint);
        points = [
            {
                controlPoint: [25, 25],
                endPoint: [25, 62.5]
            },
        
            {
                controlPoint: [25, 100],
                endPoint: [50, 100]
            },
            {
                controlPoint: [50, 120],
                endPoint: [30, 125]
            },
            {
                controlPoint: [60, 120],
                endPoint: [65, 100]
            },
            {
                controlPoint: [125, 100],
                endPoint: [125, 62.5]
            },
            {
                controlPoint: [125, 25],
                endPoint: [75, 25]
            },

        ]
        
        for (let item of points) {
            ctx.quadraticCurveTo(...item.controlPoint, ...item.endPoint);
        }
        ctx.stroke();
        for (let i=0; i<points.length; i++) {
            curPoint = i === 0 ? curPoint : points[i -1].endPoint;
            drawGuide({
                ctx,
                curPoint: curPoint,
                endPoint: points[i].endPoint,
                controlPoint: points[i].controlPoint,
            });
        }
    }
}

function drawGuide({
    ctx,
    curPoint,
    endPoint,
    controlPoint,
    pointSize = 5,
    controlPointColor='red',
    pointColor='blue'
}) {
    ctx.beginPath();
    ctx.moveTo(...curPoint);
    ctx.lineTo(...controlPoint);
    ctx.moveTo(...endPoint);
    ctx.lineTo(...controlPoint);
    ctx.strokeStyle = 'pink';
    ctx.stroke();
    ctx.fillStyle = pointColor;
    ctx.fillRect(...curPoint, pointSize, pointSize);
    ctx.fillRect(...endPoint, pointSize, pointSize);
    ctx.fillStyle = controlPointColor;
    ctx.fillRect(...controlPoint, pointSize, pointSize);
}
