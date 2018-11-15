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
var gl; //contexte
var program; //shader program
var buffers = [];

var attribPos; //attribute position
var attribColor; //attribute color
var uniformTranslation; //translation
var uniformHomothety; //translation
var uniformRotation; //translation

var mousePositions = [];
var vertexColors = [];

var translationValues = {x: 0.0, y: 0.0};
var homothetyFactor = 1.0;
var rotationAngle = 0.0;

var selectedPrimitive;

function initContext() {
    canvas = document.getElementById('dawin-webgl');
    gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('ERREUR : echec chargement du contexte');
        return;
    }
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
}

//Initialisation des shaders et du program
function initShaders() {
    var vertexShaderSource = loadText("vertex.glsl");
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
    }

    var fragmentShaderSource = loadText("fragment.glsl");
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragmentShader));
    }

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
    }

    gl.useProgram(program)
}



//Evenement souris
function initEvents() {
    canvas.onclick = function(e) {
        var x = (e.pageX/canvas.width)*2.0 - 1.0;
        var y = ((canvas.height-e.pageY)/canvas.height)*2.0 - 1.0;
        mousePositions.push(...[x,y]);
        addRandomColors(1);

        refreshBuffers();
    }

    window.addEventListener('keydown', function(e) {
        switch (e.key) {
            case "ArrowUp":
                translationValues.y += 0.01;
                break;
            case "ArrowDown":
                translationValues.y -= 0.01;
                break;
            case "ArrowLeft":
                translationValues.x -= 0.01;
                break;
            case "ArrowRight":
                translationValues.x += 0.01;
                break;
            case "+":
                homothetyFactor += 0.05;
                break;
            case "-":
                homothetyFactor -= 0.05;
                break;
            case "a":
                rotationAngle -= 0.05;
                break;
            case "e":
                rotationAngle += 0.05;
                break;
            default:
                // console.log(e.key);
                return;
        };
    });
}

//TODO
//Fonction initialisant les attributs pour l'affichage (position et taille)
function initAttributes() {
    attribPos = gl.getAttribLocation(program, "position");
    attribColor = gl.getAttribLocation(program, "aVertexColor");
    uniformTranslation = gl.getUniformLocation(program, "translation");
    uniformHomothety = gl.getUniformLocation(program, "homothety");
    uniformRotation = gl.getUniformLocation(program, "rotation");
}


//TODO
//Initialisation des buffers
function initBuffers() {
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 12, gl.STREAM_DRAW);
    gl.vertexAttribPointer(attribColor, 4, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(attribColor);
    buffers["color"] = colorBuffer;

    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8, gl.STREAM_DRAW);
    gl.vertexAttribPointer(attribPos, 2, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(attribPos);
    buffers["pos"] = posBuffer;
}

//TODO
//Mise a jour des buffers : necessaire car les coordonnees des points sont ajoutees a chaque clic
function refreshBuffers() {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers["color"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers["pos"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mousePositions), gl.STATIC_DRAW);
}

//TODO
//Fonction permettant le dessin dans le canvas
function draw() {
    requestAnimationFrame(draw);

    if (selectedPrimitive == undefined) {
        selectedPrimitive = gl.TRIANGLES;
    }

    gl.uniform2f(uniformTranslation, translationValues.x, translationValues.y);
    gl.uniform1f(uniformHomothety, homothetyFactor);
    gl.uniformMatrix2fv(uniformRotation, false, [Math.cos(rotationAngle), -Math.sin(rotationAngle), Math.sin(rotationAngle), Math.cos(rotationAngle)]);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(selectedPrimitive, 0, mousePositions.length / 2);
}

function addRandomColors(n) {
    let i;
    for (i = 0; i < n; i += 1) {
        vertexColors.push(...[
            Math.random(),
            Math.random(),
            Math.random(),
            1.0
        ]);
    }
}

function setTriangle() {
    mousePositions.push(...[-0.5, -1/3 * Math.sqrt(3/4)]);
    mousePositions.push(...[0, 2/3 * Math.sqrt(3/4)]);
    mousePositions.push(...[0.5, -1/3 * Math.sqrt(3/4)]);

    addRandomColors(3);

    refreshBuffers();
}

function setTriangrid() {
    let i, j;
    for (i = 1 ; i > -1 ; i -= 0.2) {
        for (j = -1 ; j < 1 ; j += 0.2) {
            mousePositions.push(...[j, i]);
            mousePositions.push(...[j + 0.1, i - 0.2]);
            mousePositions.push(...[j + 0.2, i]);

            addRandomColors(3);
        }
    }

    refreshBuffers();
}

function setTriansquare() {
    let i;

    selectedPrimitive = gl.TRIANGLE_FAN;

    mousePositions.push(...[0.5, 0.5]);
    mousePositions.push(...[-0.5, 0.5]);
    mousePositions.push(...[-0.5, -0.5]);
    mousePositions.push(...[0.5, -0.5]);

    addRandomColors(4);

    refreshBuffers();
}


function main() {
    initContext();
    initShaders();
    initAttributes();
    initBuffers();
    initEvents();

    setTriangle();
    // setTriangrid();
    // setTriansquare();

    draw();
}
