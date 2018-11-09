function loadText(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if(xhr.status === 200)
        return xhr.responseText;
    else {
        return null;
    }
}

// variables globales du programme;
var canvas;
var width, height;
var gl; //contexte
var program; //shader program
var buffers = {};
var attribPos; //attribute position
var attribSize; //attribute size
var uniformColor; //uniform color
var pointSize = 20;
var pointColor = [1.0, 1.0, 0.0];
var pointsCoords = [];
var pointsSize = [];
var pointsColors = [];

var MAX_POINTS = 2000;
// const pi = Math.PI
// var trigoData = [
//     pi/6, pi/4, pi/3,
//     2*pi/3, 3*pi/4, 5*pi/6,
//     7*pi/6, 5*pi/4, 4*pi/3,
//     5*pi/3, 7*pi/4, 11*pi/6
// ];

function initContext() {
    canvas = document.getElementById('dawin-webgl');
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    // gl = canvas.getContext('webgl');
    gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('ERREUR : echec chargement du contexte');
        return;
    }
    gl.clearColor(.65, .75, .4, 1);
}

//Initialisation des shaders et du program
function initShaders() {
    var vertexShaderSource = loadText("vertexShader.glsl");
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    console.log(gl.getShaderInfoLog(vertexShader));

    var fragmentShaderSource = loadText("fragmentShader.glsl");
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    console.log(gl.getShaderInfoLog(fragmentShader));

    console.log("Vertex Shader Compile Status: " + gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS));
    console.log("Fragment Shader Compile Status: " + gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS));

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    console.log("Program Link Status: " + gl.getProgramParameter(program, gl.LINK_STATUS));
    console.log(gl.getProgramInfoLog(program));
    gl.useProgram(program);
}

function initGrid() {
    pointsCoords = [];
    pointsSize = [];
    pointsColors = [];
    for (var i = -0.8; i <= 0.8 ; i += 0.2) {
        for (var j = -0.8; j <= 0.8 ; j += 0.2) {
            pointsCoords.push(...[parseFloat(i.toFixed(2)),parseFloat(j.toFixed(2))])
            pointsSize.push((i+1) * pointSize + 5)
            pointsColors.push(...[((i >= 0) ? Math.abs(i) + 0.5 : 0.0), .3, ((i <= 0) ? Math.abs(i) + 0.5 : 0.0)])
        }
    }
}

//Fonction initialisant les attributs pour l'affichage (position et taille)
function initAttributes() {
    attribPos = gl.getAttribLocation(program, "position");
    attribSize = gl.getAttribLocation(program, "size");
    attribColor = gl.getAttribLocation(program, "color");
    initGrid();

    var sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4*MAX_POINTS, gl.STREAM_DRAW);
    gl.vertexAttribPointer(attribSize, 1, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(attribSize);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(pointsSize));
    buffers["size"] = sizeBuffer;

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4*3*MAX_POINTS, gl.STREAM_DRAW);
    gl.vertexAttribPointer(attribColor, 3, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(attribColor);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(pointsColors));
    buffers["color"] = colorBuffer;

    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4*2*MAX_POINTS, gl.STREAM_DRAW);
    gl.vertexAttribPointer(attribPos, 2, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(attribPos);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(pointsCoords));
    buffers["pos"] = posBuffer;
}

function checkAvailability() {
    if (pointsSize.length >= MAX_POINTS) {
        initGrid();
    }
}

//Fonction permettant le dessin dans le canvas
function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, pointsSize.length);
}


function main() {
    initContext();
    initShaders();
    initAttributes();

    canvas.onclick = function (e) {
        checkAvailability();
        var x = e.offsetX / (width/2) - 1;
        var y = - (e.offsetY / (width/2) - 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers["size"]);
        var newSize = [Math.random() * 50];
        gl.bufferSubData(gl.ARRAY_BUFFER, 4*pointsSize.length, new Float32Array(newSize));
        pointsSize.push(...newSize);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers["color"]);
        var newColor = [Math.random(), Math.random(), Math.random()];
        gl.bufferSubData(gl.ARRAY_BUFFER, 4*pointsColors.length, new Float32Array(newColor));
        pointsColors.push(...newColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers["pos"]);
        var newPos = [x, y];
        gl.bufferSubData(gl.ARRAY_BUFFER, 4*pointsCoords.length, new Float32Array(newPos));
        pointsCoords.push(...newPos);

        draw();
    }

    canvas.onmousemove = function (e) {
        checkAvailability();
        var x = e.offsetX / (width/2) - 1;
        var y = - (e.offsetY / (width/2) - 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers["size"]);
        var newSize = [Math.random() * 50];
        gl.bufferSubData(gl.ARRAY_BUFFER, 4*pointsSize.length, new Float32Array(newSize));
        pointsSize.push(...newSize);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers["color"]);
        var newColor = [Math.random(), Math.random(), Math.random()];
        gl.bufferSubData(gl.ARRAY_BUFFER, 4*pointsColors.length, new Float32Array(newColor));
        pointsColors.push(...newColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers["pos"]);
        var newPos = [x, y];
        gl.bufferSubData(gl.ARRAY_BUFFER, 4*pointsCoords.length, new Float32Array(newPos));
        pointsCoords.push(...newPos);

        draw();
    }

    // trigoData.forEach(value => {
    //     gl.vertexAttrib4f(attribPos, Math.cos(value), Math.sin(value), 0.0, 1.0);
    //     gl.vertexAttrib1f(attribSize, pointSize);
    //     gl.uniform4f(uniformColor, Math.random(), Math.random(), Math.random(), 1.0);
    //     draw();
    // })

    draw();
}