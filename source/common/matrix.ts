import { Vector } from "./vector.js";


/*
 * TODO: Rewrite this so that the elements are "column-first" order, so there is no
 * need to transpose the result!
 */


export class Matrix {


    public readonly elements : Float32Array;


    constructor(
        a11 : number = 0.0, a12 : number = 0.0, a13 : number = 0.0, a14 : number = 0.0,
        a21 : number = 0.0, a22 : number = 0.0, a23 : number = 0.0, a24 : number = 0.0,
        a31 : number = 0.0, a32 : number = 0.0, a33 : number = 0.0, a34 : number = 0.0,
        a41 : number = 0.0, a42 : number = 0.0, a43 : number = 0.0, a44 : number = 0.0) {

        this.elements = new Float32Array(
            [a11, a12, a13, a14,
             a21, a22, a23, a24,
             a31, a32, a33, a34,
             a41, a42, a43, a44]);
    }


    public applyToVector(v : Vector) : Vector {

        return new Vector(
            this.elements[0]*v.x + this.elements[1]*v.y + this.elements[2]*v.z + this.elements[3]*v.w,
            this.elements[4]*v.x + this.elements[5]*v.y + this.elements[6]*v.z + this.elements[7]*v.w,
            this.elements[8]*v.x + this.elements[9]*v.y + this.elements[10]*v.z + this.elements[11]*v.w,
            this.elements[12]*v.x + this.elements[13]*v.y + this.elements[14]*v.z + this.elements[15]*v.w);
    }


    public applyToVector3(v : Vector) : Vector {

        return new Vector(
            this.elements[0]*v.x + this.elements[1]*v.y + this.elements[2]*v.z + this.elements[3]*1.0,
            this.elements[4]*v.x + this.elements[5]*v.y + this.elements[6]*v.z + this.elements[7]*1.0,
            this.elements[8]*v.x + this.elements[9]*v.y + this.elements[10]*v.z + this.elements[11]*1.0,
            this.elements[12]*v.x + this.elements[13]*v.y + this.elements[14]*v.z + this.elements[15]*1.0);
    }



    public applyToVector2(v : Vector) : Vector {

        return new Vector(
            this.elements[0]*v.x + this.elements[1]*v.y + this.elements[3],
            this.elements[4]*v.x + this.elements[5]*v.y + this.elements[7]);
    }


    static identity = () : Matrix => new Matrix(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);


    static translate = (x : number, y : number, z : number = 0.0) : Matrix => new Matrix(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1);

    
    static scale = (sx : number, sy : number, sz : number = 1.0) : Matrix => new Matrix(
        sx, 0,  0,  0,
        0,  sy, 0,  0,
        0,  0,  sz, 0,
        0,  0,  0,  1);


    static fromColumnVectors = (v1 : Vector, v2 : Vector, v3? : Vector) : Matrix => new Matrix(
        v1.x, v2.x, v3?.x ?? 0, 0,
        v1.y, v2.y, v3?.y ?? 0, 0,
        v1.z, v2.z, v3?.z ?? 1, 0,
        0,    0,    0,          1
    );
        

    static rotate(angle : number, x : number = 0.0, y : number = 0.0, z : number = 1.0) : Matrix {
        
        // TODO: Might want to rework this in a way you pass a *unit* vector
        // u = (x, y, z) and construct the rotation matrix based on it.

        // Source: https://en.wikipedia.org/wiki/Rotation_matrix

        const ca : number = Math.cos(angle*x);
        const sa : number = Math.sin(angle*x);

        const cb : number = Math.cos(angle*y);
        const sb : number = Math.sin(angle*y);

        const cc : number = Math.cos(angle*z);
        const sc : number = Math.sin(angle*z);

        const A : Matrix = Matrix.identity();

        A.elements[0] =  cb*cc; 
        A.elements[4] =  cb*sc; 
        A.elements[8] =  -sb;

        A.elements[1] = sa*sb*cc - ca*sc; 
        A.elements[5] = sa*sb*sc + ca*cc; 
        A.elements[9] = sa*cb;

        A.elements[2]  = ca*sb*cc + sa*sc; 
        A.elements[6]  = ca*sb*sc - sa*cc; 
        A.elements[10] = ca*cb; 

        return A;
    }


    static ortho(left : number, right : number, bottom : number, top : number, 
        near : number = -1, far : number = 1) : Matrix {

        const A : Matrix = new Matrix();

        A.elements[0] = 2.0/(right - left);
        A.elements[3] = -(right + left)/(right - left);

        A.elements[5] = 2.0/(top - bottom);
        A.elements[7] = -(top + bottom)/(top-bottom);

        A.elements[10] = -2.0/(far - near);
        A.elements[11] = -(far + near)/(far - near);

        A.elements[15] = 1.0;

        return A;
    }


    static lookAt(eye : Vector, target : Vector, upDirection : Vector = new Vector(0, 1, 0)) : Matrix {

        const A : Matrix = Matrix.identity();

        const forward : Vector = Vector.direction(target, eye);
        const left : Vector = Vector.cross(forward, upDirection);
        left.normalize(true);

        const up : Vector = Vector.cross(forward, left);
        up.normalize(true);

        A.elements[0] = left.x; 
        A.elements[1] = left.y; 
        A.elements[2] = left.z;

        A.elements[4] = up.x;
        A.elements[5] = up.y; 
        A.elements[6] = up.z;

        A.elements[8] = forward.x; 
        A.elements[9] = forward.y; 
        A.elements[10] = forward.z;

        // TODO: replace with dot product
        A.elements[3] = -left.x*eye.x - left.y*eye.y - left.z*eye.z;
        A.elements[7] = -up.x*eye.x - up.y*eye.y - up.z*eye.z;
        A.elements[11] = -forward.x*eye.x - forward.y*eye.y - forward.z*eye.z;

        return A;
    }


    static perspective(fovY : number, aspectRatio : number, near : number, far : number) : Matrix {

        const A : Matrix = new Matrix();

        const factor : number = 1.0/Math.tan( (fovY/180.0*Math.PI)/2.0);

        A.elements[0] = factor/aspectRatio;
        A.elements[5] = factor;
        A.elements[10] = -(far + near)/(far - near);

        A.elements[11] = -2.0*far*near/(far - near);
        A.elements[14] = -1.0;

        return A;
    }


    static multiply(left : Matrix, right : Matrix) : Matrix {

        const out : Matrix = new Matrix();
    
        for (let i : number = 0; i < 4; ++ i) {
        
            for (let j : number = 0; j < 4; ++ j) {
        
                for (let k : number = 0; k < 4; ++ k) {
        
                    out.elements[i*4 + j] += left.elements[i*4 + k]*right.elements[k*4 + j];
                }
            }
        }  
        return out;
    }


    static transpose(A : Matrix) : Matrix {

        const out : Matrix = new Matrix();

        for (let j : number = 0; j < 4; ++ j) {
                
            for (let i : number = 0; i < 4; ++ i) {
                    
                out.elements[i*4 + j] = A.elements[j*4 + i];
            }
        }
        return out;
    }


    public clone = () : Matrix => new Matrix(...this.elements);
}
