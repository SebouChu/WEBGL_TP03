attribute vec2 position;
attribute float size;
attribute vec4 aVertexColor;

uniform vec2 translation;
uniform float homothety;
uniform mat2 rotation;

varying vec4 vColor;

void main () {
  gl_Position = vec4(rotation * (position * homothety) + translation, 0, 1);
  gl_PointSize = (position[0] + 1.0) * 20.0;
  vColor = aVertexColor;
}