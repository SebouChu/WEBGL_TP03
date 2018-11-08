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
var buffer;
var attribPos; //attribute position
var attribSize; //attribute size
var uniformColor; //uniform color
var pointSize = 20;
var pointColor = [1.0, 1.0, 0.0];
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
    gl.useProgram(program);
}

//Fonction initialisant les attributs pour l'affichage (position et taille)
function initAttributes() {
    attribPos = gl.getAttribLocation(program, "position");
    attribSize = gl.getAttribLocation(program, "size");
    uniformColor = gl.getUniformLocation(program, "fragColor");
}

//Fonction permettant le dessin dans le canvas
function draw() {
    gl.drawArrays(gl.POINTS, 0, 1);
}


function main() {
    initContext();
    initShaders();
    initAttributes();
    gl.clear(gl.COLOR_BUFFER_BIT);
    buffer = gl.createBuffer();

    canvas.onclick = function (e) {
        var x = e.offsetX / (width/2) - 1;
        var y = - (e.offsetY / (width/2) - 1);
        gl.vertexAttrib4f(attribPos, x, y, 0.0, 1.0);
        gl.vertexAttrib1f(attribSize, Math.random() * 50);
        gl.uniform4f(uniformColor, Math.random(), Math.random(), Math.random(), 1.0);
        draw();
    }

    // trigoData.forEach(value => {
    //     gl.vertexAttrib4f(attribPos, Math.cos(value), Math.sin(value), 0.0, 1.0);
    //     gl.vertexAttrib1f(attribSize, pointSize);
    //     gl.uniform4f(uniformColor, Math.random(), Math.random(), Math.random(), 1.0);
    //     draw();
    // })

    for (var i = -0.8; i <= 0.8 ; i += 0.2) {
        for (var j = -0.8; j <= 0.8 ; j += 0.2) {
            gl.vertexAttrib4f(attribPos, i, j, 0.0, 1.0);
            gl.vertexAttrib1f(attribSize, (i+1) * pointSize + 5);
            gl.uniform4f(uniformColor, ((i >= 0) ? Math.abs(i) + 0.5 : 0.0), .3, ((i <= 0) ? i + 0.5 : 0.0), 1.0);
            draw();
        }
    }
}