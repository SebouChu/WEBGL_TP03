attribute vec2 position;
attribute float size;
attribute vec3 color;

varying vec4 fragColor;

void main () {
  gl_Position = vec4(position, 0, 1);
  gl_PointSize = size;
  fragColor = vec4(color, 1.0);
}