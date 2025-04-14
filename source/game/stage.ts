import { Assets, ProgramEvent } from "../core/interface.js";
import { Canvas, Effect } from "../gfx/interface.js";
import { Tilemap } from "../tilemap/tilemap.js";
import { Camera } from "./camera.js";
import { CollisionObject } from "./collisionobject.js";
import { RenderLayer } from "./renderlayer.js";
import { CollisionLayer } from "./collisionlayer.js";
import { Vector } from "../common/vector.js";


export class Stage {


    private mapWidth : number = 0;
    private mapHeight : number = 0;

    private renderLayer : RenderLayer;
    private collisionLayer : CollisionLayer;

    private baseMap : Tilemap;


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

        this.baseMap = baseMap;

        this.mapWidth = baseMap.width;
        this.mapHeight = baseMap.height;
    }


    public update(event : ProgramEvent) : void {

        // ...
    }


    public draw(canvas : Canvas, assets : Assets, camera : Camera) : void {

        // Shadow layer
        canvas.toggleShadowRendering(true);
        canvas.clearShadowBuffer();

        canvas.applyEffect(Effect.FixedColor);
        this.renderLayer.draw(canvas, camera, assets, true, 2, 2, 0.25);
        
        canvas.toggleShadowRendering(false);
        canvas.applyEffect(Effect.None);
        canvas.setColor();

        // Base layer
        this.renderLayer.draw(canvas, camera, assets);
    }


    public objectCollision(o : CollisionObject, camera : Camera, event : ProgramEvent) : void {

        this.collisionLayer.objectCollision(o, event);

        // o.horizontalCollision(0, 0, camera.height, -1, event);
        // o.horizontalCollision(camera.width, 0, camera.height, 1, event);
    }


    public iterateObjectLayer(event : (value : number, x : number, y : number) => void) : void {

        const objectLayer : number[] = this.baseMap.cloneLayer("objects");

        for (let y : number = 0; y < this.height; ++ y) {

            for (let x : number = 0; x < this.width; ++ x) {
                
                const value : number = objectLayer[y*this.width + x] ?? 256;

                event(value - 256, x, y);
            }
        }
    }


    public findRespawnPoint(camera : Camera) : Vector {

        const x : number = Math.floor(camera.position.x/16);

        return new Vector(x, this.collisionLayer.findRespawnPoint(x));
    }
}
