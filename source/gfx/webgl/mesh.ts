import { clamp } from "../../common/mathutil.js";
import { Mesh } from "../interface.js";


export class WebGLMesh implements Mesh {


    private vertexBuffer : WebGLBuffer | null;
    private uvBuffer : WebGLBuffer | null;
    private colorBuffer : WebGLBuffer | null;
    private normalBuffer : WebGLBuffer | null;
    private indexBuffer : WebGLBuffer | null;

    private vertexCount : number;
    private uvCount : number;
    private colorCount : number;
    private normalCount : number;

    private elementCount : number;
    private maxElementCount : number;

    private readonly gl : WebGLRenderingContext;


    // TODO: Replace underfined with null
    constructor(gl : WebGLRenderingContext, 
            vertices : Float32Array,     
            indices : Uint16Array,
            textureCoordinates : Float32Array | undefined = undefined,
            colors : Float32Array | undefined = undefined,
            normals : Float32Array | undefined = undefined,
            dynamic : boolean = false) {

        this.vertexBuffer = gl.createBuffer();
        this.uvBuffer = textureCoordinates === undefined ? null : gl.createBuffer();
        this.colorBuffer = colors === undefined ? null : gl.createBuffer();
        this.normalBuffer = normals === undefined ? null : gl.createBuffer();
        this.indexBuffer = gl.createBuffer();

        const drawType : number = dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, drawType);

        if (textureCoordinates !== undefined) {

            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, drawType);      
        }
        if (colors !== undefined) {

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, colors, drawType);      
        }
        if (normals !== undefined) {

            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, normals, drawType);      
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, drawType);

        this.vertexCount = vertices.length;
        this.uvCount = textureCoordinates?.length ?? 0;
        this.colorCount = colors?.length ?? 0;
        this.normalCount = normals?.length ?? 0;

        this.elementCount = indices.length;
        this.maxElementCount = indices.length;

        this.gl = gl;
    }


    public bind() : void {

        const gl : WebGLRenderingContext = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        if (this.uvBuffer !== null) {

            gl.enableVertexAttribArray(1);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
        }
        else {

            gl.disableVertexAttribArray(1);
        }

        if (this.colorBuffer !== null) {

            gl.enableVertexAttribArray(2);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
        }
        else {

            gl.disableVertexAttribArray(2);
        }

        if (this.normalBuffer !== null) {

            gl.enableVertexAttribArray(3);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, 0);
        }
        else {

            gl.disableVertexAttribArray(3);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }


    public draw() : void {
        
        const gl : WebGLRenderingContext = this.gl;

        gl.drawElements(gl.TRIANGLES, this.elementCount, gl.UNSIGNED_SHORT, 0);
    }


    public dispose() : void {
        
        const gl : WebGLRenderingContext = this.gl;

        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.indexBuffer);

        if (this.uvBuffer !== null){

            gl.deleteBuffer(this.uvBuffer);
        }

        if (this.colorBuffer !== null){

            gl.deleteBuffer(this.colorBuffer);
        }

        if (this.normalBuffer !== null){

            gl.deleteBuffer(this.normalBuffer);
        }
    }


    public updateVertices(newVertices : Float32Array) : boolean {

        const gl : WebGLRenderingContext = this.gl; 

        if (newVertices.length > this.vertexCount) {    

            console.warn("Vertex buffer overflow, cannot update the data!");
            return false;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, newVertices);

        return true;
    }


    public updateTextureCoordinates(newTexCoords : Float32Array) : boolean {

        const gl : WebGLRenderingContext = this.gl;

        if (newTexCoords.length > this.uvCount) {

            console.warn("Texture coordinate buffer overflow, cannot update the data!");
            return false;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, newTexCoords);

        return true;
    }


    public updateColors(newColors : Float32Array) : boolean {

        const gl : WebGLRenderingContext = this.gl;

        if (newColors.length > this.colorCount) {

            console.warn("Color buffer overflow, cannot update the data!");
            return false;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, newColors);

        return true;
    }


    public updateNormals(newNormals : Float32Array) : boolean {

        const gl : WebGLRenderingContext = this.gl;

        if (newNormals.length > this.normalCount) {

            console.warn("Color buffer overflow, cannot update the data!");
            return false;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, newNormals);

        return true;
    }


    public updateIndices(newIndices : Uint16Array) : boolean {

        const gl : WebGLRenderingContext = this.gl;

        if (newIndices.length > this.maxElementCount) {

            console.warn("Index buffer overflow, cannot update the data!");

            return false;
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, newIndices);

        this.elementCount = newIndices.length;

        return true;
    }


    public updateElementCount(newCount : number) : void {

        this.elementCount = clamp(newCount, 0, this.maxElementCount);
    }


    public getMaxElementCount = () : number => this.maxElementCount;
}
