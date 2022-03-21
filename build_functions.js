var canvas;
var ctx;

function init() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    return ctx;
}

function center_height(rect_height) {
    var ch = ((height / 2) - (rect_height / 2));
    return ch;
}

function center_width(rect_width) {
    var cw = ((height / 2) - (rect_width / 2));
    return cw;
}

function text(value, x, y, color) {
    init();
    ctx.beginPath();
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
}


function draw_rect(x, y, width, height, fill_color, stroke_color) {
    init();
    ctx.beginPath();
    ctx.fillStyle = fill_color;
    ctx.strokeStyle = stroke_color;
    ctx.strokeRect(x, y, width, height);
    ctx.fillRect(x, y, width, height);
    ctx.stroke();
    ctx.fill();
}

function draw_circle(x, y, radius, fill_color) {
    init();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fill_color;
    ctx.fill();
}


function draw_triangle(x1, y1, x2, y2, x3, y3, fill_color) {
    init();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.fillStyle = fill_color;
    ctx.fill();
}