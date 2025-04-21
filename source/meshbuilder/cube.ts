import { Vector } from "../common/vector.js";
import { Matrix } from "../common/matrix.js";
import { Rectangle } from "../common/rectangle.js";
import { MeshBuilder } from "./meshbuilder.js";
import { RGBA } from "../common/rgba.js";
import { repeatArray } from "../common/array.js";


export const addCubeSide = (builder : MeshBuilder, 
    center : Vector, scale : number, 
    left : Vector, up : Vector, front : Vector,
    color : RGBA, texCoords? : Rectangle) : void => {

    left.scale(scale/2.0);
    up.scale(scale/2.0);
    front.scale(scale/2.0);

    const c : Vector = Vector.add(center, front);

    const A : Vector = new Vector(c.x + left.x + up.x, c.y + left.y + up.y, c.z + left.z + up.z);
    const B : Vector = new Vector(c.x - left.x + up.x, c.y - left.y + up.y, c.z - left.z + up.z);
    const C : Vector = new Vector(c.x - left.x - up.x, c.y - left.y - up.y, c.z - left.z - up.z);
    const D : Vector = new Vector(c.x + left.x - up.x, c.y + left.y - up.y, c.z + left.z - up.z);

    front.normalize();

    builder.append(
        [
            A.x, A.y, A.z,
            B.x, B.y, B.z,
            C.x, C.y, C.z,

            C.x, C.y, C.z,
            D.x, D.y, D.z,
            A.x, A.y, A.z,
        ],
        [0, 1, 2, 3, 4, 5],
        texCoords !== undefined ? [

            texCoords.x, texCoords.y,
            texCoords.x + texCoords.w, texCoords.y,
            texCoords.x + texCoords.w, texCoords.y + texCoords.h,

            texCoords.x + texCoords.w, texCoords.y + texCoords.h,
            texCoords.x, texCoords.y + texCoords.h,
            texCoords.x, texCoords.y,

        ] : undefined,
        repeatArray([color.r, color.g, color.b, color.a], 6),
        repeatArray(Vector.normalize(front).toArray(3), 6)
    );
}


export const addPlane = (builder : MeshBuilder, color : RGBA, normal : Vector,
    texCoords? : Rectangle,
    transformation : Matrix = Matrix.identity()) : void => {

    const A : Vector = transformation.applyToVector3(new Vector(-0.5, -0.5, 0.0));
    const B : Vector = transformation.applyToVector3(new Vector( 0.5, -0.5, 0.0));
    const C : Vector = transformation.applyToVector3(new Vector( 0.5,  0.5, 0.0));
    const D : Vector = transformation.applyToVector3(new Vector(-0.5,  0.5, 0.0));

    builder.append(
        [
            A.x, A.y, A.z,
            B.x, B.y, B.z,
            C.x, C.y, C.z,

            C.x, C.y, C.z,
            D.x, D.y, D.z,
            A.x, A.y, A.z,
        ],
        [0, 1, 2, 3, 4, 5],
        texCoords !== undefined ? [

            texCoords.x, texCoords.y,
            texCoords.x + texCoords.w, texCoords.y,
            texCoords.x + texCoords.w, texCoords.y + texCoords.h,

            texCoords.x + texCoords.w, texCoords.y + texCoords.h,
            texCoords.x, texCoords.y + texCoords.h,
            texCoords.x, texCoords.y,

        ] : undefined,
        repeatArray([color.r, color.g, color.b, color.a], 6),
        repeatArray([normal.x, normal.y, normal.z], 6)
    );
}


export const addCube = (builder : MeshBuilder, center : Vector, scale : number, color : RGBA, texCoords? : Rectangle) : void => {

    // Front
    addCubeSide(builder, center, scale, new Vector(-1, 0, 0), new Vector(0, -1, 0), new Vector(0, 0, -1), color, texCoords);
    // Back
    addCubeSide(builder, center, scale, new Vector(-1, 0, 0), new Vector(0, -1, 0), new Vector(0, 0, 1), color, texCoords);
    // Top
    addCubeSide(builder, center, scale, new Vector(-1, 0, 0), new Vector(0, 0, -1), new Vector(0, 1, 0), color, texCoords);
    // Bottom
    addCubeSide(builder, center, scale, new Vector(-1, 0, 0), new Vector(0, 0, -1), new Vector(0, -1, 0), color, texCoords);
    // Right
    addCubeSide(builder, center, scale, new Vector(0, 0, -1), new Vector(0, -1, 0), new Vector(1, 0, 0), color, texCoords);
    // Left
    addCubeSide(builder, center, scale, new Vector(0, 0, -1), new Vector(0, -1, 0), new Vector(-1, 0, 0), color, texCoords);
}

