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
var uniformTransformMat;
var uniformPerspectiveMat;
var uniformModelViewMat;

var mousePositions = [];
var vertexColors = [];

var translationValues = {x: 0, y: 0, z: -6.0};
var scaleFactor = 1.0;
var rotationAngle = 0;

var selectedPrimitive;
var time = 0; // time for autoDraw & crazyAutoDraw
var direction = "right"; // direction for autoDraw

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
        var x = e.offsetX / (canvas.width/2) - 1;
        var y = - (e.offsetY / (canvas.width/2) - 1);
        mousePositions.push(...[x,y, (- Math.random() - 1)]);
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
            case "<":
                translationValues.z -= 0.01;
                break;
            case ">":
                translationValues.z += 0.01;
                break;
            case "+":
                scaleFactor += 0.05;
                break;
            case "-":
                scaleFactor -= 0.05;
                break;
            case "a":
                rotationAngle -= Math.PI / 48;
                // rotationAngle %= 2 * Math.PI;
                break;
            case "e":
                rotationAngle += Math.PI / 48;
                // rotationAngle %= 2 * Math.PI;
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
    uniformTransformMat = gl.getUniformLocation(program, "transformation");
    uniformPerspectiveMat = gl.getUniformLocation(program, "perspective");
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
    gl.bufferData(gl.ARRAY_BUFFER, 9, gl.STREAM_DRAW);
    gl.vertexAttribPointer(attribPos, 3, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(attribPos);
    buffers["pos"] = posBuffer;
}

function initPerspective() {
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = canvas.width / canvas.height;
    const zNear = 0.1;
    const zFar = 100.0;

    var perspectiveMat = mat4.create();
    // mat4.perspective(perspectiveMat, 90, canvas.width/canvas.height, 1, 1000);
    mat4.perspective(perspectiveMat, fieldOfView, aspect, zNear, zFar);
    console.table(perspectiveMat);

    gl.uniformMatrix4fv(uniformPerspectiveMat, false, perspectiveMat);
}

//TODO
//Mise a jour des buffers : necessaire car les coordonnees des points sont ajoutees a chaque clic
function refreshBuffers() {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers["color"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers["pos"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mousePositions), gl.STATIC_DRAW);
}

var test = false;

//TODO
//Fonction permettant le dessin dans le canvas
function draw() {
    requestAnimationFrame(draw);

    if (selectedPrimitive == undefined) {
        selectedPrimitive = gl.TRIANGLES;
    }

    let transformMat = generateTransformMatrix();
    gl.uniformMatrix4fv(uniformTransformMat, false, transformMat);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.drawArrays(selectedPrimitive, 0, mousePositions.length / 3);
}

function autoDraw() {
    requestAnimationFrame(autoDraw);

    if (selectedPrimitive == undefined) {
        selectedPrimitive = gl.TRIANGLES;
    }

    if (direction == "left") {
        translationValues.x -= 0.002;
    } else {
        translationValues.x += 0.002;
    }

    if (translationValues.x > 0.5) {
        direction = "left";
    } else if (translationValues.x < -0.5) {
        direction = "right";
    }

    let transformMat = generateTransformMatrix();
    gl.uniformMatrix4fv(uniformTransformMat, false, transformMat);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(selectedPrimitive, 0, mousePositions.length / 3);
    time += 1;
}

function crazyAutoDraw() {
    requestAnimationFrame(crazyAutoDraw);

    if (selectedPrimitive == undefined) {
        selectedPrimitive = gl.TRIANGLES;
    }

    if (time < 180) {
        translationValues.x += 0.002;
    } else if (time < 360) {
        translationValues.y += 0.002;
    } else if (time < 540) {
        translationValues.x -= 0.004;
    } else if (time < 720) {
        translationValues.y -= 0.002;
    } else if (time < 900) {
        translationValues.x += 0.002;
    }

    if (time < 225) {
        rotationAngle += Math.PI/48;
    } else if (time < 450) {
        rotationAngle += Math.PI/24;
    } else if (time < 675) {
        rotationAngle -= Math.PI/12;
    } else if (time < 900) {
        rotationAngle += Math.PI/6;
    }

    if (time < 450) {
        scaleFactor -= 0.001;
    } else if (time < 900) {
        scaleFactor += 0.001;
    }

    if (time < 900) {
        vertexColors = [];
        addRandomColors(3);
        refreshBuffers();
    }

    let transformMat = generateTransformMatrix();
    gl.uniformMatrix4fv(uniformTransformMat, false, transformMat);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(selectedPrimitive, 0, mousePositions.length / 3);
    time += 1;
    time %= 900;
}

function generateTransformMatrix() {
    let result = mat4.create();
    let rotationQuat = quat.create();

    // Axe Z
    quat.rotateZ(rotationQuat, rotationQuat, -rotationAngle);
    // quat.setAxisAngle(rotationQuat, [0, 0, 1], -rotationAngle);

    // Axe Y
    quat.rotateY(rotationQuat, rotationQuat, -rotationAngle * 0.7);
    // quat.setAxisAngle(rotationQuat, [0, 1, 0], -rotationAngle * 0.7);

    let translationVec = vec3.fromValues(translationValues.x, translationValues.y, translationValues.z);
    let scaleVec = vec3.fromValues(scaleFactor, scaleFactor, scaleFactor);
    if (!test) {
        console.log("Rotation")
        console.log(rotationQuat);
        console.log("Translation")
        console.log(translationVec);
        console.log("Scale")
        console.log(scaleVec);
        test = true;
    }

    mat4.fromRotationTranslationScale(result, rotationQuat, translationVec, scaleVec);
    return result;
}

function addRandomColors(n) {
    let i;
    for (i = 0; i < n; i += 1) {
        vertexColors.push(...[Math.random(), Math.random(), Math.random(), 1.0]);
    }
}

function setTriangle() {
    mousePositions.push(...[-0.5, -1/3 * Math.sqrt(3/4), -1]);
    mousePositions.push(...[0, 2/3 * Math.sqrt(3/4), -1]);
    mousePositions.push(...[0.5, -1/3 * Math.sqrt(3/4), -1]);

    addRandomColors(3);

    refreshBuffers();
}

function setTriangrid() {
    let i, j;
    for (i = 1 ; i > -1 ; i -= 0.2) {
        for (j = -1 ; j < 1 ; j += 0.2) {
            mousePositions.push(...[j, i, -1]);
            mousePositions.push(...[j + 0.1, i - 0.2, -1]);
            mousePositions.push(...[j + 0.2, i, -1]);

            addRandomColors(3);
        }
    }

    refreshBuffers();
}

function setTriansquare() {
    let i;

    selectedPrimitive = gl.TRIANGLE_FAN;

    mousePositions.push(...[0.5, 0.5, -1]);
    mousePositions.push(...[-0.5, 0.5, -1]);
    mousePositions.push(...[-0.5, -0.5, -1]);
    mousePositions.push(...[0.5, -0.5, -1]);

    addRandomColors(4);

    refreshBuffers();
}

function setCube() {
    mousePositions.push(...[
        // Front face
        -1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        -1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,


        // Back face
        -1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        -1.0,  1.0, -1.0,

        -1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,


        // Top face
        -1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        -1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,


        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        1.0, -1.0, -1.0,

        -1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,


        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

        1.0, -1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,


        // Left face
        -1.0, -1.0, -1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0,

        -1.0, -1.0, -1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ]);

    vertexColors.push(...([
        Array(6).fill([1.0, 0.0, 0.0, 1.0]).flat(),
        Array(6).fill([0.0, 1.0, 0.0, 1.0]).flat(),
        Array(6).fill([0.0, 0.0, 1.0, 1.0]).flat(),
        Array(6).fill([1.0, 1.0, 0.0, 1.0]).flat(),
        Array(6).fill([0.0, 1.0, 1.0, 1.0]).flat(),
        Array(6).fill([1.0, 0.0, 1.0, 1.0]).flat()
    ].flat()));
    console.log(vertexColors);

    refreshBuffers();
}


function main() {
    initContext();
    initShaders();
    initAttributes();
    initPerspective();
    initBuffers();
    initEvents();

    // setTriangle();
    // setTriangrid();
    // setTriansquare();
    setCube();

    draw();
    // autoDraw();
    // crazyAutoDraw();
}
