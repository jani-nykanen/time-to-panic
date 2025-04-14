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

    SpikeBottom = 1 << 4,
    SpikeRight  = 1 << 5,
    SpikeTop    = 1 << 6,
    SpikeLeft   = 1 << 7,
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

        const SPIKE_WIDTH : number = 10;
        const SPIKE_HEIGHT : number = 4;

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

        const spikeOffX : number = (TILE_WIDTH - SPIKE_WIDTH)/2;
        const spikeOffY : number = TILE_HEIGHT - SPIKE_HEIGHT;

        // Spike bottom
        if ((colID & CollisionBit.SpikeBottom) != 0) {

            o.hurtCollision?.(dx + spikeOffX, dy + spikeOffY, SPIKE_WIDTH, SPIKE_HEIGHT, event);
        }

        // Spike top
        if ((colID & CollisionBit.SpikeTop) != 0) {

            o.hurtCollision?.(dx + spikeOffX, dy, SPIKE_WIDTH, SPIKE_HEIGHT, event);
        }

        // Spike left
        if ((colID & CollisionBit.SpikeLeft) != 0) {

            o.hurtCollision?.(dx + spikeOffY, dy + spikeOffX, SPIKE_HEIGHT, SPIKE_WIDTH, event);
        }

        // Spike right
        if ((colID & CollisionBit.SpikeRight) != 0) {

            o.hurtCollision?.(dx, dy + spikeOffX, SPIKE_HEIGHT, SPIKE_WIDTH, event);
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

        // Falling out of the stage
        o.hurtCollision?.(0, this.height*TILE_WIDTH + 16, this.width*TILE_HEIGHT, 256, event);
    }


    public findRespawnPoint(x : number) : number {

        for (let y : number = 0; y < this.height; ++ y) {

            const colID : number = this.collisions[y*this.width + x] ?? 0;

            if ((colID & CollisionBit.Top) != 0) {

                return y;
            }
        }
        return 0;
    }
}