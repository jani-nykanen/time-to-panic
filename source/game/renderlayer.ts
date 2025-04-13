import { Tilemap } from "../tilemap/tilemap.js";
import { Assets, InputState, ProgramEvent } from "../core/interface.js";
import { Canvas, Bitmap, Flip } from "../gfx/interface.js";
import { Camera } from "./camera.js";
import { Vector } from "../common/vector.js";


export class RenderLayer {


    private layers : number[][];
    private width : number = 0;
    private height : number = 0;


    constructor(baseMap : Tilemap) {

        this.layers = new Array<number[]> ();
        for (const layer of ["bottom", "middle", "top"]) {

            this.layers.push(baseMap.cloneLayer(layer) ?? []);
        }

        this.width = baseMap.width;
        this.height = baseMap.height;
    }


    public draw(canvas : Canvas, camera : Camera, assets : Assets) : void {

        const CAMERA_MARGIN : number = 1;   

        const cameraPos : Vector = camera.position;

        const startx : number = ((cameraPos.x/16) | 0) - CAMERA_MARGIN;
        const starty : number = ((cameraPos.y/16) | 0) - CAMERA_MARGIN;

        const endx : number = startx + ((camera.width/16) | 0) + CAMERA_MARGIN*2;
        const endy : number = starty + ((camera.height/16) | 0) + CAMERA_MARGIN*2;

        const bmp : Bitmap | undefined = assets.getBitmap("tileset1");
        if (bmp === undefined) {

            return;
        }

        canvas.beginSpriteBatching(bmp);
        canvas.setColor();
        for (let layer : number = 0; layer < this.layers.length; ++ layer) {
            for (let y : number = starty; y < endy; ++ y) {

                for (let x : number = startx; x < endx; ++ x) {

                    const tileID : number = this.layers[layer][y*this.width + x] ?? 0;
                    if (tileID == 0) {

                        continue;
                    } 

                    const sx : number = (tileID - 1) % 16;
                    const sy : number = ((tileID - 1)/16) | 0;
                    canvas.drawBitmap(bmp, Flip.None, x*16, y*16, sx*16, sy*16, 16, 16);
                }
            }
        }
        canvas.endSpriteBatching();
        canvas.drawSpriteBatch();
    }
}
