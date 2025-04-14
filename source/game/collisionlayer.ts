import { Vector } from "../common/vector.js";
import { ProgramEvent } from "../core/interface.js";
import { Tilemap } from "../tilemap/tilemap.js";
import { CollisionObject } from "./collisionobject.js";
import { clamp } from "../common/mathutil.js";


const enum CollisionBit {

    None = 0,

    Top    = 1 << 0,
    Right  = 1 << 1,
    Bottom = 1 << 2,
    Left   = 1 << 3,
}


const START_INDEX : number = 257;
const TILE_WIDTH : number = 16;
const TILE_HEIGHT : number = 16;


export class CollisionLayer {


    private collisions : number[];
    private width : number;
    private height : number;


    constructor(baseMap : Tilemap, collisionMap : Tilemap) {

        this.collisions = (new Array<number> (baseMap.width*baseMap.height)).fill(0);

        this.width = baseMap.width;
        this.height = baseMap.height;

        this.computeCollisionMap(baseMap, collisionMap);
    }


    private computeTile(x : number, y : number, baseMap : Tilemap, collisionMap : Tilemap) : void {

        const LAYER_NAME : string[] = ["bottom", "middle", "top"];

        const index : number = y*this.width + x;
        for (let layer : number = 0; layer < 3; ++ layer) {

            const tileID : number = baseMap.getTile(LAYER_NAME[layer], x, y);
            if (tileID <= 0) {

                continue;
            }

            for (let i : number = 0; i < 4; ++ i) {

                const colTileID : number = collisionMap.getIndexedTile(String(i + 1), tileID - 1) - START_INDEX;
                if (colTileID < 0) {

                    continue;
                }
                this.collisions[index] |= (1 << colTileID);
            }
        }
    }


    private computeCollisionMap(baseMap : Tilemap, collisionMap : Tilemap) : void {

        for (let y : number = 0; y < this.height; ++ y) {

            for (let x : number = 0; x < this.width; ++ x) {

                this.computeTile(x, y, baseMap, collisionMap);
            }
        }
    }


    private tileCollision(o : CollisionObject, x : number, y : number, colID : number, event : ProgramEvent) : void {

        const HORIZONTAL_OFFSET : number = 1;
        const VERTICAL_OFFSET : number = 1;

        const dx : number = x*TILE_WIDTH;
        const dy : number = y*TILE_HEIGHT;

        // Floor
        if ((colID & CollisionBit.Top) != 0) {

            o.verticalCollision(dx + HORIZONTAL_OFFSET, dy,  TILE_WIDTH - HORIZONTAL_OFFSET*2, 1, event);
        }
        // Ceiling
        if ((colID & CollisionBit.Bottom) != 0) {

            o.verticalCollision(dx + HORIZONTAL_OFFSET, dy + TILE_HEIGHT, TILE_WIDTH - HORIZONTAL_OFFSET*2, -1, event);
        }
        // Left
        if ((colID & CollisionBit.Left) != 0) {

            o.horizontalCollision(dx, dy + VERTICAL_OFFSET, TILE_HEIGHT - VERTICAL_OFFSET*2, 1, event);
        }
        // Right
        if ((colID & CollisionBit.Right) != 0) {

            o.horizontalCollision(dx + TILE_WIDTH, dy + VERTICAL_OFFSET, TILE_HEIGHT - VERTICAL_OFFSET*2, -1, event);
        }
    }


    public objectCollision(o : CollisionObject, event : ProgramEvent) : void {

        const MARGIN : number = 2;

        if (!o.isActive() || !o.doesTakeCollisions()) {

            return;
        }

        const p : Vector = o.getPosition();

        const startx : number = Math.floor(p.x/TILE_WIDTH) - MARGIN;
        const starty : number = Math.floor(p.y/TILE_HEIGHT) - MARGIN;

        const endx : number = startx + MARGIN*2;
        const endy : number = starty + MARGIN*2;

        for (let x : number = startx; x <= endx; ++ x) {

            for (let y : number = starty; y <= endy; ++ y) {

                const dx : number = clamp(x, 0, this.width);
                const dy : number = clamp(y, 0, this.height);

                const colID : number = this.collisions[dy*this.width + dx] ?? 0;
                if (colID == 0) {

                    continue;
                }

                this.tileCollision(o, x, y, colID, event);
            }
        }
    }
}