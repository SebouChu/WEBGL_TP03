attribute vec2 position;
void main() {
     gl_Position = vec4(position, 0, 1);
     gl_PointSize = (position[0] + 1.0) * 20.0;
}