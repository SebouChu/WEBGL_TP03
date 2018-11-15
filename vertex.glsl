attribute vec2 position;
attribute float size;
attribute vec4 aVertexColor;

uniform mat4 transformation;

varying vec4 vColor;

void main () {
  gl_Position = transformation * vec4(position, 0, 1);
  gl_PointSize = (position[0] + 1.0) * 20.0;
  vColor = aVertexColor;
}