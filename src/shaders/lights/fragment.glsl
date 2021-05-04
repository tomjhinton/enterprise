varying vec2 vUv;

void main(){

  vec2 uv = vUv;
  float alpha = 1.;

  vec3 color = vec3(uv.x, uv.y, 1.);

  gl_FragColor = vec4(color, alpha);


}
