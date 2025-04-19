import { Vector } from "../common/vector.js";
import { Assets, InputState, ProgramEvent, Scene, SceneParameter, TransitionType } from "../core/interface.js";
import { Align, Bitmap, Canvas, Effect, Mesh, TransformTarget } from "../gfx/interface.js";
import { Camera } from "./camera.js";
import { ObjectManager } from "./objectmanager.js";
import { Stage } from "./stage.js";
import { Background } from "./background.js";
import { GameState } from "./gamestate.js";
import { HUD } from "./hud.js";
import { GameOver } from "./gameover.js";
import { PauseMenu } from "./pausemenu.js";


const THEME_VOL : number = 0.60;

const INITIAL_MONEY : number = 100;


export class GameScene implements Scene {


    private objects : ObjectManager;
    private background : Background;
    private stage : Stage | undefined = undefined;
    private camera : Camera;
    private state : GameState;
    private hud : HUD;
    private gameover : GameOver;
    private pause : PauseMenu;

    private wasPanic : boolean = false;


    constructor(event : ProgramEvent)  {

        this.state = new GameState(INITIAL_MONEY, 60);
        this.objects = new ObjectManager(this.state);
        this.camera = new Camera(0, 0, event);
        this.background = new Background(1);
        this.hud = new HUD(this.state, event);
        this.gameover = new GameOver((event : ProgramEvent) : void => this.reset(event), event);

        this.pause = new PauseMenu(event,
            (event : ProgramEvent) : void => {

                event.transition.activate(true, TransitionType.Fade, 1.0/20.0, 
                    (event : ProgramEvent) : void => {
                        this.reset(event)
                    })
            });
    }


    private reset(event : ProgramEvent) : void {

        event.audio.setMusicTrackVolume(THEME_VOL);

        this.state.reset();
        this.objects.init(this.stage, this.camera, event);
        this.objects.initialCameraCheck(this.camera, event);
        this.objects.centerTransitionToPlayer(event.transition, this.camera);

        this.wasPanic = false;
    }


    private drawShadowLayer(canvas : Canvas, assets : Assets) : void {

        const SHADOW_ALPHA : number = 0.25;

        canvas.toggleShadowRendering(true);
        canvas.clearShadowBuffer();
        canvas.applyEffect(Effect.FixedColor);

        canvas.move(2, 2);

        this.stage?.drawShadowLayer(canvas, assets, this.camera, SHADOW_ALPHA);
        this.objects.drawShadowLayer(canvas, assets, SHADOW_ALPHA);

        canvas.toggleShadowRendering(false);
        canvas.applyEffect(Effect.None);
        canvas.setColor();

        canvas.move(-2, -2);
    }


    public init(param : SceneParameter, event : ProgramEvent) : void {

        this.stage = new Stage(
            event.assets.getTilemap("level1"),
            event.assets.getTilemap("collisions1"));
        this.objects.init(this.stage, this.camera, event);
        this.objects.initialCameraCheck(this.camera, event);
        this.objects.centerTransitionToPlayer(event.transition, this.camera);

        event.audio.fadeInMusic(event.assets.getSample("theme"), THEME_VOL, 1000);
    
        this.wasPanic = false;
    }


    public update(event : ProgramEvent) : void {

        if (event.transition.isActive()) {

            return;
        }

        if (!this.gameover.isActive()) {

            if (this.pause.isActive()) {

                this.pause.update(event);
                return;
            }

            if (event.input.getAction("pause") == InputState.Pressed) {

                event.audio.playSample(event.assets.getSample("start"), 0.60);
                this.pause.activate();
                return;
            }
        }

        if (this.state.money > 0) {

            this.wasPanic = false;
        }
        else if (!this.wasPanic) {

            event.audio.playSample(event.assets.getSample("panic"), 0.60);
            this.wasPanic = true;
        }

        this.camera.update(event);
        this.stage?.update(event);
        this.objects.update(this.stage, this.camera, event);

        this.state.update(event);
        this.hud.update(event);

        this.gameover.update(event);

        if (!this.gameover.isActive() && !this.objects.isPlayerAlive()) {

            event.audio.setMusicTrackVolume(THEME_VOL/2.0);
            this.gameover.activate();
            this.camera.shake(0, 0);

            event.audio.playSample(event.assets.getSample("gameover"), 0.60);
        }
    }


    public redraw(canvas : Canvas, assets : Assets, isCloningToBuffer : boolean = false): void {
        
        canvas.moveTo();
        canvas.clear(0, 85, 170);

        this.background.draw(canvas, assets, this.camera);

        this.camera.apply(canvas, true);

        this.drawShadowLayer(canvas, assets);
        
        this.stage?.draw(canvas, assets, this.camera);
        this.objects.draw(canvas, assets);

        canvas.moveTo();

        if (this.gameover.isActive()) {

            this.gameover.draw(canvas, assets);
            return;
        }
        this.hud.draw(canvas, assets);

        this.pause.draw(canvas, assets);
    }


    public dispose() : SceneParameter {
        
        return undefined;
    }

}

