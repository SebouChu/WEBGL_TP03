attribute vec4 position;
attribute float size;

void main () {
  gl_Position = position;
  gl_PointSize = size;
}