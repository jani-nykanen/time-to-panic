import { Renderer, Mesh } from "../gfx/interface.js";


export class MeshBuilder {


    private vertices : number[];
    private texCoords : number[];
    private colors : number[];
    private normals : number[];
    private indices : number[];

    private maxIndex : number = 0;


    private readonly renderer : Renderer;


    constructor(renderer : Renderer) {

        this.renderer = renderer;

        this.vertices = new Array<number> ();
        this.texCoords = new Array<number> ();
        this.colors = new Array<number> ();
        this.normals = new Array<number> ();
        this.indices = new Array<number> ();
    }


    public append(newVertices : number[], newIndices : number[], 
        newTexCoords : number[] | null = null,
        newColors : number[] | null = null,
        newNormals : number[] | null = null) : void {

        if (newVertices.length % 3 != 0) {

            throw new Error("The number of vertices has to be divisible by 3.");
        }

        this.vertices.push(...newVertices);
        if (newColors !== null) {

            this.colors.push(...newColors);
        }
        if (newTexCoords !== null) {

            this.texCoords.push(...newTexCoords);
        }
        if (newNormals !== null) {

            this.normals.push(...newNormals);
        }

        for (let i : number = 0; i < newIndices.length; ++ i) {

            this.indices.push(this.maxIndex + newIndices[i]);
        }
        this.maxIndex += newVertices.length/3.0;
    }


    public build(flush : boolean = false) : Mesh {

        const mesh : Mesh = this.renderer.createMesh(
            this.vertices, 
            this.indices, 
            this.texCoords.length == 0 ? undefined : this.texCoords, 
            this.colors.length == 0 ? undefined : this.colors, 
            this.normals.length == 0 ? undefined : this.normals,
            false);

        if (flush) {

            this.vertices.length = 0;
            this.indices.length = 0;
            this.texCoords.length = 0;
            this.colors.length = 0;
            this.normals.length = 0;
        }

        return mesh;
    }
}