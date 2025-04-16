import { Vector } from "./../common/vector.js";
import { Assets, ProgramEvent } from "./../core/interface.js";
import { Canvas, Bitmap, Flip } from "./../gfx/interface.js";
import { CollisionObject } from "./collisionobject.js";
import { AnimatedSprite } from "./../gfx/sprite.js";
import { Camera } from "./camera.js";
import { Rectangle } from "./../common/rectangle.js";
import { Player } from "./player.js";



export class SpecialCollider extends CollisionObject {


    constructor(x : number, y : number) {

        super(x, y, true);
    }


    public playerCollision?(player : Player, camera : Camera, event : ProgramEvent) : void;
}
