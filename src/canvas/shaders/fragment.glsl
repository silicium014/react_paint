precision mediump float;

varying vec4 v_color;

void main() {
    float distance = length(gl_PointCoord - vec2(0.5));
    if (distance > 0.5) {
        discard;
    }
    gl_FragColor = v_color;
}
