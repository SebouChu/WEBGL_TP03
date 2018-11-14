attribute vec2 position;
attribute float size;
attribute vec4 aVertexColor;

varying vec4 vColor;

void main () {
  gl_Position = vec4(position, 0, 1);
  gl_PointSize = (position[0] + 1.0) * 20.0;
  vColor = aVertexColor;
}