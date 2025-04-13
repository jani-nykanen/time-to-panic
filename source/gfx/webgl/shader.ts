import { Matrix } from "../../common/matrix.js";
import { Vector } from "../../common/vector.js";


const UNIFORM_VARIABLE_NAMES : string[] = [

    "transform",
    "rotation",
    "pos",
    "scale",

    "texPos",
    "texScale",
    "color",
    "texSampler",
    "lightDirection",
    "lightMagnitude"
];


export class Shader {


    private uniforms : Map<string, WebGLUniformLocation | null>;
    private program : WebGLShader;

    private readonly gl : WebGLRenderingContext;


    constructor(gl : WebGLRenderingContext, vertexSource : string, fragmentSource : string) {

        this.gl = gl;

        this.uniforms = new Map<string, WebGLUniformLocation | null> ();
        this.program = this.buildShader(vertexSource, fragmentSource);

        this.getUniformLocations();
    }
    

    private createShader(src : string, type : number) : WebGLShader {

        const gl : WebGLRenderingContext  = this.gl
    
        const shader : WebGLShader | null = gl.createShader(type);
        if (shader === null) {

            throw new Error("Failed to create a shader!");
        }

        gl.shaderSource(shader, src);
        gl.compileShader(shader);
    
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    
            throw new Error("WebGL shader error:\n" + gl.getShaderInfoLog(shader));
        }
        return shader;
    }


    private buildShader(vertexSource : string, fragmentSource : string) : WebGLShader {

        const gl : WebGLRenderingContext = this.gl;
    
        const vertex : WebGLProgram | null = this.createShader(vertexSource, gl.VERTEX_SHADER);
        const frag : WebGLProgram | null  = this.createShader(fragmentSource, gl.FRAGMENT_SHADER);
        const program : WebGLProgram | null = gl.createProgram();
        if (program === null) {

            throw new Error("Failed to create a WebGL shader program!");
        }

        gl.attachShader(program, vertex);
        gl.attachShader(program, frag);
    
        this.bindLocations(program);

        gl.linkProgram(program);
    
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    
            throw new Error("Shader error: " + gl.getProgramInfoLog(program));
        }
        return program;
    }

    
    private bindLocations(program : WebGLShader) : void {

        const gl : WebGLRenderingContext = this.gl;

        gl.bindAttribLocation(program, 0, "vertexPos");
        gl.bindAttribLocation(program, 1, "vertexUV");
        gl.bindAttribLocation(program, 2, "vertexColor");
        gl.bindAttribLocation(program, 3, "vertexNormal");
    }


    private getUniformLocations() : void {

        const gl : WebGLRenderingContext = this.gl;
        for (const name of UNIFORM_VARIABLE_NAMES) {  

            this.uniforms.set(name, gl.getUniformLocation(this.program, name));
        }
    }


    public use() : void {

        const gl : WebGLRenderingContext = this.gl;
    
        gl.useProgram(this.program);
        this.getUniformLocations();

        const locationSampler : WebGLUniformLocation | null = this.uniforms.get("texSampler") ?? null;
        if (locationSampler !== null) {

            gl.uniform1i(locationSampler, 0);
        }

        const identity : Matrix = Matrix.identity();
        const unit : Vector = new Vector(1, 0, 0);

        this.setVertexTransform(0, 0, 0, 1, 1, 1);
        this.setFragTransform(0, 0, 1, 1);
        this.setTransformMatrix(identity);
        this.setRotationMatrix(identity);
        this.setColor(1, 1, 1, 1);
        this.setLighting(unit, 0.0);
    }


    public setVertexTransform(
        x : number, y : number, z : number, 
        w : number, h : number, depth : number = 1.0) : void {

        const gl : WebGLRenderingContext = this.gl;

        const locationPos : WebGLUniformLocation | null = this.uniforms.get("pos") ?? null;
        const locationScale : WebGLUniformLocation | null = this.uniforms.get("scale") ?? null;
        if (locationPos === null || locationScale === null) {

            return;
        }

        gl.uniform3f(locationPos, x, y, z);
        gl.uniform3f(locationScale, w, h, depth);
    }


    public setFragTransform(x : number, y : number, w : number, h : number) : void {

        const gl : WebGLRenderingContext = this.gl;

        const locationPos : WebGLUniformLocation | null | undefined = this.uniforms.get("texPos") ?? null;
        const locationScale : WebGLUniformLocation | null | undefined = this.uniforms.get("texScale") ?? null;
        if (locationPos === null || locationScale === null) {

            return;
        }

        gl.uniform2f(locationPos, x, y);
        gl.uniform2f(locationScale, w, h);
    }


    public setColor(r : number = 1, g : number = 1, b : number = 1, a : number = 1) : void {

        const gl : WebGLRenderingContext = this.gl;

        const location : WebGLUniformLocation | null = this.uniforms.get("color") ?? null;
        if (location === null) {

            return;
        }
        gl.uniform4f(location, r, g, b, a);
    }


    public setTransformMatrix(matrix : Matrix) : void {

        const gl : WebGLRenderingContext = this.gl;

        const location : WebGLUniformLocation | null = this.uniforms.get("transform") ?? null;
        if (location === null) {

            return;
        }
        gl.uniformMatrix4fv(location, false, matrix.elements);      
    }


    public setRotationMatrix(matrix : Matrix) : void {

        const gl : WebGLRenderingContext = this.gl;

        const location : WebGLUniformLocation | null = this.uniforms.get("rotation") ?? null;
        if (location === null) {

            return;
        }
        gl.uniformMatrix4fv(location, false, matrix.elements);     
    }


    public setLighting(direction : Vector, magnitude : number) : void {

        const gl : WebGLRenderingContext = this.gl;

        const locationDirection : WebGLUniformLocation | null = this.uniforms.get("lightDirection") ?? null;
        const locationMagnitude : WebGLUniformLocation | null = this.uniforms.get("lightMagnitude") ?? null;

        if (locationDirection === null || locationMagnitude === null) {

            return;
        }

        gl.uniform3f(locationDirection, direction.x, direction.y, direction.z);
        gl.uniform1f(locationMagnitude, magnitude);
    }
}
