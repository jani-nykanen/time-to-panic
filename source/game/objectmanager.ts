import { Assets, ProgramEvent } from "../core/interface.js";
import { Bitmap, Canvas } from "../gfx/interface.js";
import { Camera } from "./camera.js";
import { ObjectGenerator } from "./objectgenerator.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";
import { Coin } from "./coin.js";
import { GameState } from "./gamestate.js";


export class ObjectManager {


    private player : Player | undefined = undefined;

    private coins : Coin[];

    private readonly state : GameState;


    constructor(state : GameState) {
        
        this.coins = new Array<Coin> ();

        this.state = state;
    }


    private updateCoins(camera : Camera, event : ProgramEvent) : void {

        for (let i : number = 0; i < this.coins.length; ++ i) {

            const c : Coin = this.coins[i];
            c.cameraCheck(camera, event);
            c.update(camera, event);
            c.playerCollision(this.player!, event);

            if (!c.doesExist()) {

                this.coins.splice(i, 1);
            }
        }
    }


    public init(stage : Stage | undefined, event : ProgramEvent) : void {

        stage.iterateObjectLayer((value : number, x : number, y : number) : void => {

            const dx : number = x*16 + 8;
            const dy : number = y*16 + 8;

            switch (value) {

            // Player
            case 1:

                this.player = new Player(dx, dy, this.state);
                break;

            // Coin
            case 2:
                // Fallthrough
            // Gem
            case 3:

                this.coins.push(new Coin(dx, dy, value - 2));
                break;

            default:
                break;
            }

        });
    }


    public update(stage : Stage | undefined, camera : Camera, event : ProgramEvent) : void {

        this.player?.update(camera, event);
        this.player?.cameraCheck(camera, event);
        this.player?.stageEvent(camera, stage, event);
        stage?.objectCollision(this.player, camera, event);
    
        this.updateCoins(camera, event);
    }


    public draw(canvas : Canvas, assets : Assets) : void {

        this.player?.preDraw(canvas, assets);

        const bmpCoin : Bitmap | undefined = assets.getBitmap("coin");
        for (const c of this.coins) {
            
            c.draw(canvas, assets, bmpCoin);
        }

        this.player?.draw(canvas, assets);
    }
}
