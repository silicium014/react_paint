attribute vec2 a_position;
attribute vec4 a_color;
attribute float a_size;

varying vec4 v_color;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    gl_PointSize = a_size;
    v_color = a_color;
}