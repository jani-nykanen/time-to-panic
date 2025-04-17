import { Assets, ProgramEvent } from "../core/interface.js";
import { Bitmap, Canvas } from "../gfx/interface.js";
import { Camera } from "./camera.js";
import { ObjectGenerator } from "./objectgenerator.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";
import { Coin } from "./coin.js";
import { GameState } from "./gamestate.js";
import { FlyingText } from "./flyingtext.js";
import { Enemy } from "./enemies/enemy.js";
import { getEnemyByIndex } from "./enemies/index.js";
import { SpecialCollider } from "./specialcollider.js";
import { Spring } from "./spring.js";
import { Direction } from "./direction.js";
import { MovingPlatform } from "./movingplatform.js";
import { Bubble } from "./bubble.js";


export class ObjectManager {


    private player : Player | undefined = undefined;
    private coins : Coin[];
    private enemies : Enemy[];
    private specialColliders : SpecialCollider[];
    private flyingText : ObjectGenerator<FlyingText>;

    private readonly state : GameState;


    constructor(state : GameState) {
        
        this.coins = new Array<Coin> ();
        this.enemies = new Array<Enemy> ();
        this.specialColliders = new Array<SpecialCollider> ();
        this.flyingText = new ObjectGenerator<FlyingText> (FlyingText);

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


    private updateEnemies(stage : Stage | undefined, camera : Camera, event : ProgramEvent) : void {

        for (let i : number = 0; i < this.enemies.length; ++ i) {

            const e : Enemy = this.enemies[i];
            e.cameraCheck(camera, event);
            e.update(camera, event);
            stage?.objectCollision(e, camera, event);
            e.playerCollision(this.player!, event);

            if (e.isActive() && e.doesCheckEnemyCollisions()) {

                for (let j : number = i + 1; j < this.enemies.length; ++ j) {

                    e.enemyCollision(this.enemies[j], event);
                }
            }

            if (!e.doesExist()) {

                this.enemies.splice(i, 1);
            }
        }
    }


    private updateSpecialColliders(stage : Stage | undefined, camera : Camera, event : ProgramEvent) : void {

        for (let i : number = 0; i < this.specialColliders.length; ++ i) {

            const o : SpecialCollider = this.specialColliders[i];
            o.cameraCheck(camera, event);
            o.update(camera, event);
            stage?.objectCollision(o, camera, event);
            o.playerCollision?.(this.player!, camera, event);

            /*
            if (!o.doesExist()) {

                this.enemies.splice(i, 1);
            }
            */
        }
    }


    private drawCoins(canvas : Canvas, assets : Assets, shadowLayer : boolean) : void {

        const bmpCoin : Bitmap | undefined = assets.getBitmap("coin");
        for (const c of this.coins) {
            
            c.draw(canvas, assets, bmpCoin, shadowLayer);
        }
    }


    private drawEnemies(canvas : Canvas, assets : Assets, shadowLayer : boolean) : void {

        const bmpEnemies : Bitmap | undefined = assets.getBitmap("enemies");
        for (const e of this.enemies) {
            
            e.draw(canvas, assets, bmpEnemies, shadowLayer);
        }
    }


    private drawSpecialColliders(canvas : Canvas, assets : Assets) : void {

        const bmp : Bitmap | undefined = assets.getBitmap("special_colliders");

        // canvas.beginSpriteBatching(bmp);
        for (const o of this.specialColliders) {
            
            o.draw(canvas, assets, bmp);
        }
        // canvas.endSpriteBatching();
        // canvas.drawSpriteBatch();
    }

    
    private drawObjects(canvas : Canvas, assets : Assets, shadowLayer : boolean) : void {

        this.player?.preDraw(canvas, assets);

        this.drawSpecialColliders(canvas, assets);
        this.drawCoins(canvas, assets, shadowLayer);
        this.drawEnemies(canvas, assets, shadowLayer);
        this.player?.draw(canvas, assets, undefined, shadowLayer);
    }


    public init(stage : Stage | undefined, camera : Camera, event : ProgramEvent) : void {

        const SPRING_LOOKUP : Direction[] = [
            Direction.Up, 
            Direction.None, Direction.None, 
            Direction.Right, Direction.Left, Direction.Down]; 

        const ENEMY_START_INDEX : number = 33;

        stage.iterateObjectLayer((value : number, x : number, y : number) : void => {

            const dx : number = x*16 + 8;
            const dy : number = y*16 + 8;

            switch (value) {

            // Player
            case 1:

                this.player = new Player(dx, dy, this.state, this.flyingText);
                camera.focusTo(this.player?.getPosition());
                break;

            // Coin
            case 2:
                // Fallthrough
            // Gem
            case 3:

                this.coins.push(new Coin(dx, dy, value - 2));
                break;
            
            // Spring
            case 4:
            case 7:
            case 8:
            case 9:
                this.specialColliders.push(new Spring(dx, dy, SPRING_LOOKUP[value - 4] ?? Direction.Up));
                break;

            // Vertical platform
            case 5:
            case 6:
                this.specialColliders.push(new MovingPlatform(dx, dy, value == 6));
                break;

            // Bubble
            case 10:

                this.specialColliders.push(new Bubble(dx, dy));
                break;

            default:

                // Enemies
                if (value >= ENEMY_START_INDEX) {

                    // Heh, e-type
                    const etype : Function = getEnemyByIndex(value - ENEMY_START_INDEX);
                    this.enemies.push(new etype.prototype.constructor(dx, dy));
                }
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
        this.updateEnemies(stage, camera, event);
        this.updateSpecialColliders(stage, camera, event);
        this.flyingText.update(camera, event);
    }


    public drawShadowLayer(canvas : Canvas, assets : Assets, shadowAlpha : number = 0.25) : void {

        canvas.setColor(0, 0, 0, shadowAlpha);
        this.drawObjects(canvas, assets, true);
    }


    public draw(canvas : Canvas, assets : Assets) : void {

        this.drawObjects(canvas, assets, false);

        this.flyingText.draw(canvas, assets, assets.getBitmap("font_outlines"));
    }


    public initialCameraCheck(camera : Camera, event : ProgramEvent) : void {

        for (const c of this.coins) {

            c.cameraCheck(camera, event);
        }

        for (const e of this.enemies) {

            e.cameraCheck(camera, event);
        }

        for (const o of this.specialColliders) {

            o.cameraCheck(camera, event);
        }
    }
}
