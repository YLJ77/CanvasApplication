function draw() {
    let canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        let points;
        let ctx = canvas.getContext('2d');
        let curPoint = [75, 40];
        ctx.beginPath();
        ctx.moveTo(...curPoint);
        points = [
            {
                controlPoint: [
                    [75, 37],
                    [70, 25]
                ],
                endPoint: [50, 25],
            },
            {
                controlPoint: [
                    [20, 25],
                    [20, 62.5]
                ],
                endPoint: [20, 62.5],
            },
            {
                controlPoint: [
                    [20, 80],
                    [40, 102]
                ],
                endPoint: [75, 120],
            },
            {
                controlPoint: [
                    [110, 102],
                    [130, 80]
                ],
                endPoint: [130, 62.5],
            },
            {
                controlPoint: [
                    [130, 62.5],
                    [130, 25]
                ],
                endPoint: [100, 25],
            },
            {
                controlPoint: [
                    [85, 25],
                    [75, 37]
                ],
                endPoint: [75, 40],
            },
        ]
        
        for (let item of points) {
            ctx.bezierCurveTo(...item.controlPoint[0].concat(item.controlPoint[1].concat(item.endPoint)));
        }
        //ctx.fill();
        ctx.stroke();
        for (let i=0; i<points.length; i++) {
            curPoint = i === 0 ? curPoint : points[i -1].endPoint;
            //if (i > 0) return;
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
    pointSize = 2,
    controlPointColor='red',
    pointColor='blue'
}) {
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    ctx.fillStyle = pointColor;
    ctx.moveTo(...curPoint);
    ctx.arc(...curPoint, pointSize, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(...curPoint);
    ctx.fillStyle = controlPointColor;
    ctx.lineTo(...controlPoint[0]);
    ctx.arc(...controlPoint[0], pointSize, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill()

    ctx.beginPath();
    ctx.moveTo(...controlPoint[0]);
    ctx.fillStyle = pointColor;
    ctx.moveTo(...endPoint);
    ctx.arc(...endPoint, pointSize, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();


    ctx.beginPath();
    ctx.moveTo(...endPoint);
    ctx.fillStyle = controlPointColor;
    ctx.lineTo(...controlPoint[1]);
    ctx.arc(...controlPoint[1], pointSize, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();

    // ctx.fillRect(...curPoint, pointSize, pointSize);
    // ctx.fillRect(...endPoint, pointSize, pointSize);
    // ctx.fillStyle = controlPointColor;
    // ctx.fillRect(...controlPoint[0], pointSize, pointSize);
    // ctx.fillRect(...controlPoint[1], pointSize, pointSize);
}
