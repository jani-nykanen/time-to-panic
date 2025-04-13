import { RGBA } from "../../common/rgba.js";
import { Vector } from "../../common/vector.js";
import { WebGLMesh } from "./mesh.js";


const rotatePoint = (p : Vector, shiftx : number, shifty : number, 
    center : Vector, angle : number) : void => {

    const px : number = p.x - shiftx - center.x;
    const py : number = p.y - shiftx - center.y;

    const c : number = Math.cos(angle);
    const s : number = Math.sin(angle);

    const dx : number = px*c - py*s;
    const dy : number = px*s + py*c;

    p.x = dx + shiftx + center.x;
    p.y = dy + shifty + center.y;
}


export class SpriteBatch {


    private bufferMesh : WebGLMesh;

    private vertexBuffer : Float32Array;
    private uvBuffer : Float32Array;
    private colorBuffer : Float32Array;

    private elementPointer : number = 0;
    private prepared : boolean = false;

    private blockSize : number = 256;
    private maxSize : number = 256;

    private readonly gl : WebGLRenderingContext;


    public get outputMesh() : WebGLMesh {

        return this.bufferMesh;
    }


    constructor(gl : WebGLRenderingContext, blockSize : number = 256) {

        this.blockSize = blockSize;
        this.maxSize = blockSize;

        const zerosFloat2 : Float32Array = new Float32Array((new Array<number> (this.maxSize*6*2)).fill(0.0));
        const zerosFloat3 : Float32Array = new Float32Array((new Array<number> (this.maxSize*6*3)).fill(0.0));
        const unitsFloat : Float32Array = new Float32Array((new Array<number> (this.maxSize*6*4)).fill(1.0));

        const indices : Uint16Array = new Uint16Array (this.maxSize*6);
        for (let i : number = 0; i < indices.length; ++ i) {

            indices[i] = i;
        }

        this.bufferMesh = new WebGLMesh(gl, 
            zerosFloat3, indices, zerosFloat2, unitsFloat, undefined, true);

        this.vertexBuffer = new Float32Array (this.maxSize*6*3);
        this.uvBuffer = new Float32Array (this.maxSize*6*2);
        this.colorBuffer = new Float32Array (this.maxSize*6*4);

        this.gl = gl;
    }


    private resize() : void {

        // TODO: Make sure to test this at one point!

        this.maxSize += this.blockSize;

        this.bufferMesh.dispose();

        const zerosFloat2 : Float32Array = new Float32Array((new Array<number> (this.maxSize*6*2)).fill(0.0));
        const zerosFloat3 : Float32Array = new Float32Array((new Array<number> (this.maxSize*6*3)).fill(0.0));
        const unitsFloat : Float32Array = new Float32Array((new Array<number> (this.maxSize*6*4)).fill(1.0));

        const indices : Uint16Array = new Uint16Array (this.maxSize*6);
        for (let i : number = 0; i < indices.length; ++ i) {

            indices[i] = i;
        }

        this.bufferMesh = new WebGLMesh(this.gl, 
            zerosFloat3, indices, zerosFloat2, unitsFloat, undefined, true);

        const oldVertices : Float32Array = this.vertexBuffer;
        const oldUVs : Float32Array = this.uvBuffer;
        const oldColors : Float32Array = this.colorBuffer;

        this.vertexBuffer = new Float32Array (this.maxSize*6*3);
        this.uvBuffer = new Float32Array (this.maxSize*6*2);
        this.colorBuffer = new Float32Array (this.maxSize*6*4);

        // Copy old data back
        for (let i : number = 0; i < oldVertices.length; ++ i) {

            // Vertex & UV buffers should also be of the same size,
            // hence only one for loop.
            this.vertexBuffer[i] = oldVertices[i];
            this.uvBuffer[i] = oldUVs[i];
        }
        for (let i : number = 0; i < oldColors.length; ++ i) {

            this.colorBuffer[i] = oldColors[i];
        }

        // TODO: Replace "log" with "debug" (or remove once guaranteed to work?)
        console.log("DEBUG: Sprite batch buffer resized.");
    }


    public flush() : void {

        this.elementPointer = 0;
        this.prepared = false;
    }

    
    public pushSprite(sx : number, sy : number, sw : number, sh : number,
        dx : number, dy : number, dw : number, dh : number, depth : number,
        color : RGBA, rotation? : number, center? : Vector) : void {

        const ROTATION_THRESHOLD : number = 0.00001;

        if (this.elementPointer + 6 >= this.maxSize) {

            this.resize();
        }

        const A : Vector = new Vector(dx, dy);
        const B : Vector = new Vector(dx + dw, dy);
        const C : Vector = new Vector(dx + dw, dy + dh);
        const D : Vector = new Vector(dx, dy + dh);

        if (rotation !== undefined && Math.abs(rotation) > ROTATION_THRESHOLD) {

            center ??= new Vector(dw/2.0, dh/2.0);

            rotatePoint(A, dx, dy, center, rotation);
            rotatePoint(B, dx, dy, center, rotation);
            rotatePoint(C, dx, dy, center, rotation);
            rotatePoint(D, dx, dy, center, rotation);
        }
        
        // Vertices
        let p : number = this.elementPointer*3;
        this.vertexBuffer[p] = A.x;
        this.vertexBuffer[p + 1] = A.y;
        this.vertexBuffer[p + 2] = depth;

        this.vertexBuffer[p + 3] = B.x;
        this.vertexBuffer[p + 4] = B.y;
        this.vertexBuffer[p + 5] = depth;

        this.vertexBuffer[p + 6] = C.x;
        this.vertexBuffer[p + 7] = C.y;
        this.vertexBuffer[p + 8] = depth;

        this.vertexBuffer[p + 9] = C.x;
        this.vertexBuffer[p + 10] = C.y;
        this.vertexBuffer[p + 11] = depth;

        this.vertexBuffer[p + 12] = D.x;
        this.vertexBuffer[p + 13] = D.y;
        this.vertexBuffer[p + 14] = depth;

        this.vertexBuffer[p + 15] = A.x;
        this.vertexBuffer[p + 16] = A.y;
        this.vertexBuffer[p + 17] = depth;

        // Texture coordinates
        p = this.elementPointer*2;
        this.uvBuffer[p] = sx;
        this.uvBuffer[p + 1] = sy;

        this.uvBuffer[p + 2] = sx + sw;
        this.uvBuffer[p + 3] = sy;

        this.uvBuffer[p + 4] = sx + sw;
        this.uvBuffer[p + 5] = sy + sh;

        this.uvBuffer[p + 6] = sx + sw;
        this.uvBuffer[p + 7] = sy + sh;

        this.uvBuffer[p + 8] = sx;
        this.uvBuffer[p + 9] = sy + sh;

        this.uvBuffer[p + 10] = sx;
        this.uvBuffer[p + 11] = sy;
        
        // Colors
        p = this.elementPointer*4;
        for (let i : number = 0; i < 6; ++ i) {

            this.colorBuffer[p + i*4] = color.r;
            this.colorBuffer[p + i*4 + 1] = color.g;
            this.colorBuffer[p + i*4 + 2] = color.b;
            this.colorBuffer[p + i*4 + 3] = color.a;
        }
    
        this.elementPointer += 6;
    }


    public prepareMesh() : boolean {

        if (this.elementPointer == 0) {

            return false;
        }

        if (this.prepared) {

            return true;
        }

        const max : number = this.bufferMesh.getMaxElementCount();
        if (this.elementPointer > max) {

            // TODO: This should not occur anymore?
            this.elementPointer = max;
            console.warn("This part of the code should not be reached...");
        }

        // Update vertices, uv coords and colors. Note that there is no need to
        // update the index buffer.
        this.bufferMesh.updateVertices(this.vertexBuffer.subarray(0, this.elementPointer*6*3));
        this.bufferMesh.updateTextureCoordinates(this.uvBuffer.subarray(0, this.elementPointer*6*2));
        this.bufferMesh.updateColors(this.colorBuffer.subarray(0, this.elementPointer*6*4));
        this.bufferMesh.updateElementCount(this.elementPointer);
        
        this.prepared = true;

        return true;
    }


    public anythingToDraw = () : boolean => this.prepared;
}
