

export const VertexSource = {


    Textured : 
        
    `
    attribute vec3 vertexPos;
    attribute vec2 vertexUV;
    attribute vec4 vertexColor;
    
    uniform mat4 transform;
    
    uniform vec3 pos;
    uniform vec3 scale;
    
    varying vec2 uv;
    varying vec4 vcolor;
    
    
    void main() {
    
        gl_Position = transform*vec4(vertexPos*scale + pos, 1);
        uv = vertexUV;
        vcolor = vertexColor;
    }`,
    

    NoTexture : 
        
    `
    attribute vec3 vertexPos;
    attribute vec4 vertexColor;
    
    uniform mat4 transform;
    
    uniform vec3 pos;
    uniform vec3 scale;

    varying vec4 vcolor;


    void main() {
    
        gl_Position = transform*vec4(vertexPos*scale + pos, 1);
        vcolor = vertexColor;
    }`,


    TexturedLighting : 
        
    `
    attribute vec3 vertexPos;
    attribute vec2 vertexUV;
    attribute vec4 vertexColor;
    attribute vec3 vertexNormal;
    
    uniform mat4 transform;
    uniform mat4 rotation;
    
    uniform vec3 pos;
    uniform vec3 scale;
    
    varying vec2 uv;
    varying vec4 vcolor;
    varying vec4 normal;
    
    
    void main() {
    
        gl_Position = transform*vec4(vertexPos*scale + pos, 1);
        uv = vertexUV;
        vcolor = vertexColor;

        normal = rotation*vec4(vertexNormal, 1);
    }`,


    NoTextureLighting : 
        
    `
    attribute vec3 vertexPos;
    attribute vec4 vertexColor;
    attribute vec3 vertexNormal;

    uniform mat4 transform;
    uniform mat4 rotation;
    
    uniform vec3 pos;
    uniform vec3 scale;

    varying vec4 vcolor;
    varying vec4 normal;

    void main() {
    
        gl_Position = transform*vec4(vertexPos*scale + pos, 1);
        vcolor = vertexColor;

        normal = rotation*vec4(vertexNormal, 1);
    }`,
};
    
    
export const FragmentSource = {
    
    Textured : 
    
    `
    precision mediump float;
         
    uniform sampler2D texSampler;
    
    uniform vec4 color;
    
    uniform vec2 texPos;
    uniform vec2 texScale;
    
    varying vec2 uv;
    varying vec4 vcolor;

    
    void main() {
    
        vec2 tex = uv*texScale + texPos;    
        vec4 res = texture2D(texSampler, tex)*color*vcolor;
        
        // Needed to make the stencil buffer work
        if (res.a < 1.0/255.0) {

              discard;
        }
        gl_FragColor = res;
    }`,


    TexturedLighting : 
    
    `
    precision mediump float;
         
    uniform sampler2D texSampler;
    
    uniform vec4 color;
    uniform vec3 lightDirection;
    uniform float lightMagnitude;

    uniform vec2 texPos;
    uniform vec2 texScale;
    
    varying vec2 uv;
    varying vec4 vcolor;
    varying vec4 normal;

    
    void main() {
    
        float light = (1.0 - lightMagnitude) + lightMagnitude*(dot(normal.xyz, lightDirection));

        vec2 tex = uv*texScale + texPos;    
        vec4 res = texture2D(texSampler, tex)*color*vcolor;
        res.xyz *= light;
        
        // Needed to make the stencil buffer work
        if (res.a < 1.0/255.0) {

              discard;
        }
        gl_FragColor = res;
    }`,


    TexturedFixedColor : 
    
    `
    precision mediump float;
         
    uniform sampler2D texSampler;
    
    uniform vec4 color;
    
    uniform vec2 texPos;
    uniform vec2 texScale;
    
    varying vec2 uv;
    varying vec4 vcolor;

    
    void main() {
    
        vec2 tex = uv*texScale + texPos;    
        float alpha = vcolor.a*color.a*texture2D(texSampler, tex).a;
    
        // Needed to make the stencil buffer work
        if (alpha < 1.0/255.0) {
        
              discard;
        }
        gl_FragColor = vec4(color.rgb*vcolor.rgb, alpha);
    }`,


    TexturedInvert : 
    
    `
    precision mediump float;
         
    uniform sampler2D texSampler;
    
    uniform vec4 color;
    
    uniform vec2 texPos;
    uniform vec2 texScale;
    
    varying vec2 uv;
    varying vec4 vcolor;

    
    void main() {
    
        vec2 tex = uv*texScale + texPos;    
        vec4 res = texture2D(texSampler, tex)*color*vcolor;
        
        // Needed to make the stencil buffer work
        if (res.a < 1.0/255.0) {

            discard;
      }
        gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) - res.xyz, res.w);
    }`,


    TexturedBlackAndWhite : 
    
    `
    precision mediump float;
         
    uniform sampler2D texSampler;
    
    uniform vec4 color;
    
    uniform vec2 texPos;
    uniform vec2 texScale;
    
    varying vec2 uv;
    varying vec4 vcolor;
    
    void main() { 
    
        vec2 tex = uv*texScale + texPos;    
        vec4 buffer = texture2D(texSampler, tex);
        vec4 colorMod = color*vcolor;
        
        float v = 0.299*buffer.r + 0.587*buffer.g + 0.114*buffer.b;
        vec4 res = vec4(v*colorMod.r, v*colorMod.g, v*colorMod.b, colorMod.a*buffer.a);
        
        // Needed to make the stencil buffer work
        if (res.a < 1.0/255.0) {

              discard;
        }
        gl_FragColor = res;
    }`,
    
    
    NoTexture : 
    
    `
    precision mediump float;
    
    uniform vec4 color;
    
    varying vec4 vcolor;


    void main() {
    
        gl_FragColor = color*vcolor;
    }`,


    NoTextureLighting : 
    
    `
    precision mediump float;
    
    uniform vec4 color;
    uniform vec3 lightDirection;
    uniform float lightMagnitude;

    varying vec4 vcolor;
    varying vec4 normal;

    void main() {
    
        float light = (1.0 - lightMagnitude) + lightMagnitude*(1.0 + dot(normal.xyz, lightDirection))/2.0;

        vec4 res = color*vcolor;
        res.xyz *= light;

        gl_FragColor = res;
    }`,
    
};