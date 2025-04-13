import { RGBA } from "../../common/rgba.js";
import { Vector } from "../../common/vector.js";
import { Mesh, Bitmap, Canvas, Renderer, TransformTarget } from "../interface.js";
import { WebGLBitmap } from "./bitmap.js";
import { WebGLCanvas } from "./canvas.js";
import { WebGLMesh } from "./mesh.js";
import { Shader } from "./shader.js";
import { FragmentSource, VertexSource } from "./shadersource.js";
import { WebGLTransform } from "./transform.js";


const createCanvasElement = (width : number, height : number) : [HTMLCanvasElement, WebGLRenderingContext | null] => {

    const div : HTMLDivElement = document.createElement("div");
    div.id = "base_div";
    div.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;");
    
    const canvas : HTMLCanvasElement = document.createElement("canvas");
    canvas.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;");

    canvas.width = width;
    canvas.height = height;

    div.appendChild(canvas);
    document.body.appendChild(div);

    return [
        canvas, 
        canvas.getContext("webgl", {alpha: false, antialias: true, stencil: true})
    ];
}


const initGL = (gl : WebGLRenderingContext) : void => {

    gl.activeTexture(gl.TEXTURE0);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, 
        gl.ONE_MINUS_SRC_ALPHA, gl.ONE, 
        gl.ONE_MINUS_SRC_ALPHA);

    // Enable this once and never disable since
    // you never drawn anything without vertices!
    gl.enableVertexAttribArray(0);

    gl.stencilMask(0xff);
    gl.disable(gl.STENCIL_TEST);
}


export const enum ShaderType {

    Textured = 0,
    NoTexture = 1,
    FixedColorTextured = 2,
    InvertTextured = 3,
    BlackAndWhite = 4,
    TexturedLighting = 5,
    NoTextureLighting = 6,
};


export const enum StencilCondition {

    Always = 0, 
    NotEqual = 1,
    Equal = 2,
    GreaterOrEqual = 3,
    LessOrEqual = 4,
    Less = 5,
    Greater = 6
};


export const enum StencilOperation {

    Keep = 0,
    Zero = 1,
};


export const createRectangleMesh = (gl : WebGLRenderingContext) : Mesh =>
    new WebGLMesh(
        gl,
        new Float32Array([
            0, 0, 0,
            1, 0, 0,
            1, 1, 0,
            0, 1, 0,
        ]),
        new Uint16Array([
            0, 1, 2, 
            2, 3, 0
        ]),
        new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            0, 1]),
        new Float32Array([
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ])
);


export class WebGLRenderer implements Renderer {


    private canvas : WebGLCanvas;
    private preserveSquarePixels : boolean = true;

    private htmlCanvas : HTMLCanvasElement;
    private gl : WebGLRenderingContext;

    private screenWidth : number = 1;
    private screenHeight : number = 1;

    private dynamicCanvas : boolean;
    private maxCanvasWidth : number | undefined;
    private maxCanvasHeight : number | undefined;
    private targetWidth : number;
    private targetHeight : number;

    private canvasPos : Vector;
    private canvasScale : Vector;

    private internalMeshRect : Mesh;
    private internalTransform : WebGLTransform;
    private canvasTransform : WebGLTransform;

    private shaders : Map<ShaderType, Shader>;
    private activeShader : Shader | undefined = undefined;

    private activeMesh : Mesh | undefined = undefined;
    private activeBitmap : Bitmap | undefined = undefined;
    private activeColor : RGBA;
    private activeLightDirection : Vector = new Vector();
    private activeLightMagnitude : number = 0.0;


    public get width() : number {

        return this.screenWidth;
    }


    public get height() : number {

        return this.screenHeight;
    }


    public get canvasWidth() : number {

        return this.canvas.width;
    }


    public get canvasHeight() : number {

        return this.canvas.height;
    }


    constructor(canvasWidth : number = undefined, 
        canvasHeight : number = undefined, 
        preserveSquarePixels : boolean = false,  
        dynamicCanvas : boolean = false, 
        linearFilter : boolean = false,
        maxCanvasWidth : number | undefined = undefined, 
        maxCanvasHeight : number | undefined = undefined) {

        const [hcanvas, gl] : [HTMLCanvasElement, WebGLRenderingContext | null] = createCanvasElement(window.innerWidth, window.innerHeight);
        if (gl === null) {

            throw new Error("Failed to create a WebGL context!");
        } 

        this.htmlCanvas = hcanvas;
        this.gl = gl;

        initGL(gl);

        this.internalMeshRect = createRectangleMesh(gl);
        this.internalTransform = new WebGLTransform();
        this.internalTransform.setTarget(TransformTarget.Camera);

        this.canvasTransform = new WebGLTransform();
        this.canvas = new WebGLCanvas(this, this.canvasTransform, this.gl, canvasWidth, canvasHeight, linearFilter);

        this.shaders = new Map<ShaderType, Shader> ();
        this.shaders.set(ShaderType.Textured, 
            new Shader(gl, VertexSource.Textured, FragmentSource.Textured));
        this.shaders.set(ShaderType.NoTexture, 
            new Shader(gl, VertexSource.NoTexture, FragmentSource.NoTexture));
        this.shaders.set(ShaderType.FixedColorTextured, 
            new Shader(gl, VertexSource.Textured, FragmentSource.TexturedFixedColor));
        this.shaders.set(ShaderType.InvertTextured, 
            new Shader(gl, VertexSource.Textured, FragmentSource.TexturedInvert));
        this.shaders.set(ShaderType.BlackAndWhite, 
            new Shader(gl, VertexSource.Textured, FragmentSource.TexturedBlackAndWhite));   
        this.shaders.set(ShaderType.TexturedLighting, 
            new Shader(gl, VertexSource.TexturedLighting, FragmentSource.TexturedLighting));   
        this.shaders.set(ShaderType.NoTextureLighting, 
            new Shader(gl, VertexSource.NoTextureLighting, FragmentSource.NoTextureLighting));   

        this.activeShader = this.shaders.get(ShaderType.Textured);
        this.activeShader?.use();
        this.canvasTransform.setActiveShader(this.activeShader);

        this.canvasPos = new Vector();
        this.canvasScale = new Vector(1, 1);

        this.activeColor = new RGBA();

        this.dynamicCanvas = dynamicCanvas;
        this.preserveSquarePixels = preserveSquarePixels;
        this.maxCanvasWidth = maxCanvasWidth;
        this.maxCanvasHeight = maxCanvasHeight;
        this.targetWidth = canvasWidth ?? 0;
        this.targetHeight = canvasHeight ?? 0;

        this.resize(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", () => this.resize(window.innerWidth, window.innerHeight));
    }


    private resizeCanvasFramebuffer(width : number, height : number) : void {

        if (this.canvas.width == width && this.canvas.height == height) {

            return;
        }

        // Compute new optimal size
        const targetRatio : number = this.targetWidth/this.targetHeight;
        const windowRatio : number = width/height;

        let newWidth : number = 0;
        let newHeight : number = 0;

        if (windowRatio >= targetRatio) {

            newWidth = Math.round(windowRatio*this.targetHeight);
            newHeight = this.targetHeight;
        }
        else {

            newWidth = this.targetWidth;
            newHeight = Math.round(this.targetWidth/windowRatio);
        }

        newWidth = Math.min(newWidth, this.maxCanvasWidth ?? newWidth);
        newHeight = Math.min(newHeight, this.maxCanvasHeight ?? newHeight);

        this.canvas.recreate(this.gl, newWidth, newHeight);
    }


    public resize(width : number, height : number) : void {

        const gl : WebGLRenderingContext = this.gl;

        gl.viewport(0, 0, width, height);
        
        this.htmlCanvas.width = width;
        this.htmlCanvas.height = height;

        this.screenWidth = width;
        this.screenHeight = height;

        if (!this.canvas.hasFramebuffer()) {

            return;
        }

        if (this.dynamicCanvas) {

            this.resizeCanvasFramebuffer(width, height);
        }

        let multiplier : number = Math.min(width/this.canvas.width, height/this.canvas.height);
        if (multiplier > 1.0 && this.preserveSquarePixels) {

            multiplier |= 0;
        }

        this.canvasScale.x = multiplier*this.canvas.width;
        this.canvasScale.y = multiplier*this.canvas.height;

        this.canvasPos.x = width/2 - this.canvasScale.x/2;
        this.canvasPos.y = height/2 - this.canvasScale.y/2;

        this.internalTransform.view2D(this.screenWidth, this.screenHeight);
    }


    public changeShader(type : ShaderType) : void {

        const shader : Shader | undefined = this.shaders.get(type);
        if (shader === undefined || this.activeShader === shader) {

            return;
        }

        this.activeShader = shader;
        shader.use();

        this.canvasTransform.setActiveShader(this.activeShader);
        this.canvasTransform.apply();
        shader.setColor(
            this.activeColor.r, 
            this.activeColor.g, 
            this.activeColor.b, 
            this.activeColor.a);
        shader.setLighting(this.activeLightDirection, this.activeLightMagnitude);
    }


    public clear(r : number, g : number, b : number) : void {

        const gl : WebGLRenderingContext = this.gl;
        gl.clearColor(r, g, b, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }


    public bindTexture(bmp : Bitmap | undefined) : void {

        if (this.activeBitmap === bmp) {

            return;
        }
        this.activeBitmap = bmp;
        bmp?.bind();
    }   


    public drawMesh(mesh : Mesh) : void {

        if (this.activeMesh !== mesh) {

            this.activeMesh = mesh;
            mesh.bind();
        }
        mesh.draw();
    }


    public setColor(r : number, g : number, b : number, a : number) : void {

        this.activeColor = new RGBA(r, g, b, a);
        this.activeShader?.setColor(r, g, b, a);
    }


    public setAlpha(alpha : number) : void {

        this.activeColor.a = alpha;

        this.activeShader?.setColor(
            this.activeColor.r, 
            this.activeColor.g, 
            this.activeColor.b, 
            alpha);
    }


    public setVertexTransform(x : number = 0, y : number = 0, z : number = 0.0,
        w : number = 1, h : number = 1, depth : number = 1) : void {

        this.activeShader?.setVertexTransform(x, y, z, w, h, depth);
    }


    public setFragmenTransform(x : number = 0, y : number = 0, w : number = 1, h : number = 1) : void {

        this.activeShader?.setFragTransform(x, y, w, h);
    }


    public drawToCanvas(cb: (canvas: Canvas) => void) : void {

        const gl : WebGLRenderingContext  = this.gl;

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        this.canvas.setRenderTarget();
        cb(this.canvas);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, this.screenWidth, this.screenHeight);
    }


    public refresh() : void {

        if (!this.canvas.hasFramebuffer()) {

            return;
        }

        const gl : WebGLRenderingContext  = this.gl;
        const shader : Shader | undefined = this.shaders.get(ShaderType.Textured);
        if (shader === undefined) {

            return;
        }

        if (shader !== this.activeShader) {

            shader.use();
        }
        this.internalTransform.setActiveShader(shader);
        this.internalTransform.apply();

        shader.setVertexTransform(
            Math.round(this.canvasPos.x),  Math.round(this.canvasPos.y + this.canvasScale.y), 0,
            Math.round(this.canvasScale.x), -Math.round(this.canvasScale.y), 1.0);
        shader.setFragTransform(0, 0, 1, 1);
        shader.setColor(1, 1, 1, 1);
        
        this.clear(0, 0, 0);

        this.internalMeshRect.bind();
        this.canvas.bind();
        this.internalMeshRect.draw();

        gl.bindTexture(gl.TEXTURE_2D, null);

        if (shader !== this.activeShader) {

            this.activeShader?.use();
            // this.internalTransform.setActiveShader(this.activeShader);
        }

        this.activeMesh?.bind();
        this.activeBitmap?.bind();
        this.activeShader?.setColor(
            this.activeColor.r, 
            this.activeColor.g, 
            this.activeColor.b, 
            this.activeColor.a);
    }
    

    public createBitmap(img : HTMLImageElement, linearFilter : boolean = false, 
        repeatx : boolean = false, repeaty : boolean = false) : Bitmap {

        const gl : WebGLRenderingContext = this.gl;
        return new WebGLBitmap(gl, img, linearFilter, repeatx, repeaty);
    }


    public createMesh(vertices : number[], indices : number[],
        textureCoords? : number[], colors? : number[], normals? : number[],
        dynamic? : boolean) : Mesh {

        return new WebGLMesh(this.gl, 
            new Float32Array(vertices), 
            new Uint16Array(indices), 
            textureCoords === undefined ? undefined : new Float32Array(textureCoords), 
            colors === undefined ? undefined : new Float32Array(colors), 
            normals === undefined ? undefined : new Float32Array(normals),
            dynamic);
    }


    public nullActiveBitmap() : void {

        this.activeBitmap = undefined;
    }


    public cloneCanvasToBufferBitmap() : void {

        this.canvas.cloneToBufferBitmap();
    }


    public createBitmapFromPixelData(pixels : Uint8Array, width : number, height : number) : Bitmap {

        return new WebGLBitmap(this.gl, undefined, false, false, false, false, width, height, pixels);
    }


    public setStencilCondition(cond : StencilCondition) {

        const gl : WebGLRenderingContext = this.gl;

        const FUNCTION_LOOKUP : number[] = [
            gl.ALWAYS, gl.NOTEQUAL, gl.EQUAL, gl.GEQUAL, gl.LEQUAL, gl.LESS, gl.GREATER
        ];

        gl.stencilFunc(FUNCTION_LOOKUP[cond], 1, 0xff);
    }


    public setStencilOperation(op : StencilOperation) {

        const gl : WebGLRenderingContext = this.gl;

        const FAIL_LOOKUP : number[] = [gl.KEEP, gl.ZERO];
        const PASS_LOOKUP : number[] = [gl.REPLACE, gl.ZERO]

        gl.stencilOp(FAIL_LOOKUP[op], FAIL_LOOKUP[op], PASS_LOOKUP[op]);
    } 


    public clearStencilBuffer() {

        const gl : WebGLRenderingContext = this.gl;

        gl.clear(gl.STENCIL_BUFFER_BIT);
    }


    public toggleStencilTest(state : boolean) {

        const gl : WebGLRenderingContext = this.gl;

        if (state) {

            gl.enable(gl.STENCIL_TEST);
            return;
        }
        gl.disable(gl.STENCIL_TEST);
    }


    public toggleDepthTesting(state : boolean) : void {

        const gl : WebGLRenderingContext = this.gl;
        if (state) {

            gl.enable(gl.DEPTH_TEST);
            return;
        }
        gl.disable(gl.DEPTH_TEST);
    }


    public clearDepth() : void {

        const gl : WebGLRenderingContext = this.gl;

        gl.clear(gl.DEPTH_BUFFER_BIT);
    }


    public setLighting(direction : Vector, magnitude : number) : void {

        this.activeLightDirection.makeEqual(direction);
        this.activeLightMagnitude = magnitude;

        this.activeShader?.setLighting(direction, magnitude);
    }
}
