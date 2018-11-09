void main() {
     gl_FragColor = vec4(gl_FragCoord.x/800.0, 0.0, 700.0 - gl_FragCoord.x/700.0,1.0);
}