import { Assets, ProgramEvent } from "../core/interface.js";
import { Canvas } from "../gfx/interface.js";
import { Tilemap } from "../tilemap/tilemap.js";
import { Camera } from "./camera.js";
import { CollisionObject } from "./collisionobject.js";
import { RenderLayer } from "./renderlayer.js";
import { CollisionLayer } from "./collisionlayer.js";


export class Stage {


    private mapWidth : number = 0;
    private mapHeight : number = 0;

    private renderLayer : RenderLayer;
    private collisionLayer : CollisionLayer;


    public get width() {

        return this.mapWidth;
    }
    public get height() {

        return this.mapHeight;
    }


    constructor(baseMap : Tilemap | undefined, collisionMap : Tilemap | undefined) {

        if (baseMap === undefined) {

            throw new Error("Empty tilemap provided to stage!");
        }
        if (collisionMap === undefined) {

            throw new Error("Empty collision map provided to stage!");
        }

        this.renderLayer = new RenderLayer(baseMap);
        this.collisionLayer = new CollisionLayer(baseMap, collisionMap);
    }


    public update(event : ProgramEvent) : void {

        // ...
    }


    public draw(canvas : Canvas, assets : Assets, camera : Camera) : void {

        this.renderLayer.draw(canvas, camera, assets);
    }


    public objectCollision(o : CollisionObject, camera : Camera, event : ProgramEvent) : void {

        this.collisionLayer.objectCollision(o, event);

        o.horizontalCollision(0, 0, camera.height, -1, event);
        o.horizontalCollision(camera.width, 0, camera.height, 1, event);
    }
}
