import { Matrix } from "../../common/matrix.js";
import { Vector } from "../../common/vector.js";
import { Transform, TransformTarget } from "../interface.js";
import { Shader } from "./shader.js";


class Target {

    public matrix : Matrix;
    public stack : Matrix[];
    
    constructor() {

        this.matrix = Matrix.identity();
        this.stack = new Array<Matrix> ();
    }
}


export class WebGLTransform implements Transform {


    private target : Map<TransformTarget, Target>;
    private activeTarget : Target;
    private product : Matrix;

    public applyRotation : boolean = false;
    public rotation : Matrix;
    public rotationStack : Matrix[];

    private productComputed : boolean = true;

    private activeShader : Shader | undefined = undefined;

    private viewDimensions : Vector;


    public get viewSize() : Vector {

        return this.viewDimensions.clone();
    }


    constructor() {

        const initialTarget = new Target();

        this.target = new Map<TransformTarget, Target> ();

        this.target.set(TransformTarget.Model, initialTarget);
        this.target.set(TransformTarget.Projection, new Target());
        this.target.set(TransformTarget.Camera, new Target());

        this.activeTarget = initialTarget;
        this.product = Matrix.identity();

        this.viewDimensions = new Vector(1, 1);

        this.rotation = Matrix.identity();
        this.rotationStack = new Array<Matrix> ();
        this.applyRotation = true;
    }


    private computeProduct() : void {

        const view : Matrix = this.target.get(TransformTarget.Camera)?.matrix ?? Matrix.identity();
        const model : Matrix = this.target.get(TransformTarget.Model)?.matrix ?? Matrix.identity();
        const projection : Matrix = this.target.get(TransformTarget.Projection)?.matrix ?? Matrix.identity();

        // Ah, there the transpose was!
        this.product = Matrix.transpose(
            Matrix.multiply(projection, Matrix.multiply(view, model))
        );
        // Also need to transpose this
        this.rotation = Matrix.transpose(this.rotation);
    }


    public setTarget(target : TransformTarget) : void {

        this.activeTarget = this.target.get(target) ?? this.activeTarget;
        this.applyRotation = target == TransformTarget.Model;
    }


    public loadIdentity() : void {
        
        this.activeTarget.matrix = Matrix.identity();
        if (this.applyRotation) {

            this.rotation = Matrix.identity();
        }

        this.productComputed = false;
    }


    public translate(x : number, y : number, z : number = 0.0) : void {
        
        this.activeTarget.matrix = Matrix.multiply(
            this.activeTarget.matrix,
            Matrix.translate(x, y, z));
        
        this.productComputed = false;
    }


    public scale(sx : number, sy : number, sz : number = 1.0) : void {
        
        this.activeTarget.matrix = Matrix.multiply(
            this.activeTarget.matrix,
            Matrix.scale(sx, sy, sz));
        
        this.productComputed = false;
    }


    public rotate(angle: number, x : number = 0.0, y : number = 0.0, z : number = 1.0) : void {

        const operator : Matrix = Matrix.rotate(angle, x, y, z);

        this.activeTarget.matrix = Matrix.multiply(this.activeTarget.matrix, operator);
        if (this.applyRotation) {

            this.rotation = Matrix.multiply(this.rotation, operator);
        }

        this.productComputed = false;
    }


    public operateBasis(v1 : Vector, v2 : Vector, v3? : Vector) : void {

        const operator : Matrix = Matrix.fromColumnVectors(v1, v2, v3);

        this.activeTarget.matrix = Matrix.multiply(this.activeTarget.matrix, operator);
        if (this.applyRotation) {

            this.rotation = Matrix.multiply(this.rotation, operator);
        }
        
        this.productComputed = false;
    }


    public mirror(x : -1 | 1, y : -1 | 1, z : -1 | 1) : void {

        const operator : Matrix = Matrix.scale(x, y, z);

        this.activeTarget.matrix = Matrix.multiply(this.activeTarget.matrix, operator);
        if (this.applyRotation) {

            this.rotation = Matrix.multiply(this.rotation, operator);
        }

        this.productComputed = false;
    }


    public view2D(width : number, height : number) : void {
        
        this.activeTarget.matrix = Matrix.ortho(0, width, height, 0);
        this.viewDimensions.x = width;
        this.viewDimensions.y = height;

        this.productComputed = false;
    }


    public lookAt(eye : Vector, target : Vector, up? : Vector) : void {
        
        this.activeTarget.matrix = Matrix.lookAt(eye, target, up);
        this.productComputed = false;
    }


    public perspective(fovY : number, aspectRatio : number, near : number, far : number) : void {

        this.activeTarget.matrix = Matrix.perspective(fovY, aspectRatio, near, far);
        this.productComputed = true;
    }


    public ortho(left : number, right : number, bottom : number, top : number, 
        near : number = -1, far : number = 1) : void {

        this.activeTarget.matrix = Matrix.ortho(left, right, bottom, top, near, far);
        this.productComputed = true;
    }
    

    public fitDimension(dimension : number, width : number, height : number) : void {

        const ratio : number = width/height;
        if (ratio >= 1.0) {

            this.view2D(Math.round(ratio*dimension), dimension);
            return;
        }

        this.view2D(dimension, Math.round(dimension/ratio));
    }


    public push() : void {
        
        const MAX_SIZE : number = 64;

        if (this.activeTarget.stack.length >= MAX_SIZE) {

            throw new Error("DEBUG: Matrix stack overflow.");
        }

        this.activeTarget.stack.push(this.activeTarget.matrix.clone());
        if (this.applyRotation) {

            if (this.rotationStack.length >= MAX_SIZE) {

                throw new Error("DEBUG: Rotation matrix stack overflow.");
            }

            this.rotationStack.push(this.rotation.clone());
        }
    }


    public pop() : void {

        this.activeTarget.matrix = this.activeTarget.stack.pop() ?? this.activeTarget.matrix;
        if (this.applyRotation) {

            this.rotation = this.rotationStack.pop() ?? this.rotation;
        }

        this.productComputed = false;
    }

    
    public apply() : void {

        if (!this.productComputed) {

            this.computeProduct();
            this.productComputed = true;
        }
        this.activeShader?.setTransformMatrix(this.product);
        this.activeShader?.setRotationMatrix(this.rotation);
    }


    public isProductComputed = () : boolean => this.productComputed;


    public setActiveShader(shader : Shader | undefined = undefined) : void {

        this.activeShader = shader;
    }
}
