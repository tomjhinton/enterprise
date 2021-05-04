varying vec2 vUv;

void main(){

  vec2 uv = vUv;
  float alpha = 1.;

  vec3 color = vec3(1., uv.y, uv.x);

  gl_FragColor = vec4(color, alpha);


}
