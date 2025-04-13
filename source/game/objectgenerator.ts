import { Assets, ProgramEvent } from "../core/interface.js";
import { Canvas, Bitmap } from "../gfx/interface.js";
import { GameObject } from "./gameobject.js";
import { next } from "./existingobject.js";
import { Camera } from "./camera.js";


export class ObjectGenerator<T extends GameObject> {


    protected objects : T[];
    protected baseType : Function;


    constructor(baseType : Function) {

        this.baseType = baseType;
        this.objects = new Array<T> ();
    }


    public next(...args : any[]) : T {

        let o : T | undefined = next<T> (this.objects);
        if (o === undefined) {

            o = new this.baseType.prototype.constructor(...args) as T;
            this.objects.push(o); 
        }
        return o!;
    }


    public update(camera : Camera, event : ProgramEvent) : void {

        for (const o of this.objects) {

            if (!o.doesExist()) {

                continue;
            }
            o.update(camera, event);
        }   
    }


    public draw(canvas : Canvas, assets : Assets | undefined, bmp : Bitmap | undefined) : void {
        
        for (const o of this.objects) {

            o.draw?.(canvas, assets, bmp);
        }
    }


    public clear() : void {

        this.objects.length = 0;
    }


    public flush() : void {

        for (const o of this.objects) {

            o.forceKill();
        }
    }
} 
