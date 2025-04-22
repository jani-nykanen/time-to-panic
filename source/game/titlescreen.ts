import { Vector } from "../common/vector.js";
import { Assets, InputState, ProgramEvent, Scene, SceneParameter, TransitionType } from "../core/interface.js";
import { Align, Bitmap, Canvas, Effect, Flip, Mesh, TransformTarget } from "../gfx/interface.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { MeshBuilder } from "../meshbuilder/meshbuilder.js";


const TITLE_THEME_VOL : number = 0.60;


const createSpiralMesh = (baseFactor : number, radius : number, thicknessFactor : number, event : ProgramEvent) : Mesh => {


    const builder : MeshBuilder = event.createMeshBuilder();

    const path = (t : number) : Vector => new Vector(
        t*t*Math.cos(t*baseFactor)*radius,
        t*t*Math.sin(t*baseFactor)*radius);

    const lastPoint : Vector = new Vector(0.0, 0.0);
    const lastNormal : Vector = new Vector(0.0, 0.0);

    const white : number[] = (new Array<number> (4*4)).fill(1.0);
    const indices : number[] = [0, 1, 2, 2, 3, 0];

    const steps : number = 256;
    for (let i : number = 0; i < steps; ++ i) {

        const t : number = i/steps;

        const nextPoint : Vector = path(t);
        const tangent : Vector = Vector.normalize(Vector.subtract(nextPoint, lastPoint), true);        
        const nextNormal : Vector = new Vector(tangent.y, -tangent.x);

        const thickness : number = t*thicknessFactor;
        nextNormal.x *= thickness;
        nextNormal.y *= thickness;

        const A : Vector = Vector.subtract(lastPoint, lastNormal);
        const B : Vector = Vector.subtract(nextPoint, nextNormal);
        const C : Vector = Vector.add(nextPoint, nextNormal);
        const D : Vector = Vector.add(lastPoint, lastNormal);
        
        builder.append(
            [A.x, A.y, 0.0, 
             B.x, B.y, 0.0, 
             C.x, C.y, 0.0, 
             D.x, D.y, 0.0],
             indices, null, white);

        lastPoint.makeEqual(nextPoint);
        lastNormal.makeEqual(nextNormal);
    }

    return builder.build();
}


export class TitleScreenScene implements Scene {


    private rotation : number = 0.0;
    private meshSpiral : Mesh;

    private pressSpaceStr : string = "";
    private spaceTimer : number = 0.0;

    private spritePlayer : AnimatedSprite;
    private spriteGem : AnimatedSprite;
    private playerRadiusFactor : number = 0.0;

    private logoYOffset : number = 0;


    constructor(event : ProgramEvent)  {

        this.meshSpiral = createSpiralMesh(Math.PI*12, 1.25, 0.10, event);

        this.pressSpaceStr = event.localization?.getItem("press_space")?.[0] ?? "";

        this.spritePlayer = new AnimatedSprite(24, 24);
        this.spriteGem = new AnimatedSprite(24, 24);
    }


    private drawSpinningPlayer(canvas : Canvas, assets : Assets) : void {

        const centerx : number = canvas.width/2;
        const centery : number = canvas.height/2;

        const radius : number = 40 + Math.sin(this.playerRadiusFactor)*20;

        const bmpPlayer : Bitmap | undefined = assets.getBitmap("player");
        const bmpCoin : Bitmap | undefined = assets.getBitmap("coin");

        for (let j : number = 1; j >= 0; -- j) {

            if (j == 0) {

                canvas.setColor();
            }
            else {

                canvas.setColor(0, 0, 0, 0.33);
            }

            const offset : number = j*4;

            this.spritePlayer.draw(canvas, bmpPlayer, 
                centerx + Math.sin(this.rotation)*radius - 12 + offset, 
                centery + Math.cos(this.rotation)*radius - 12 + offset, 
                Flip.None);
            this.spriteGem.draw(canvas, bmpCoin,
                centerx - Math.sin(this.rotation)*radius - 12 + offset, 
                centery - Math.cos(this.rotation)*radius - 12 + offset, 
                Flip.None);

        }
    }


    private drawLogo(canvas : Canvas, bmp : Bitmap) : void {

        const BASE_Y_OFF : number = -128;
        const AMPLITUDE : number = 4.0;

        canvas.beginSpriteBatching(bmp);
        canvas.drawVerticallyWavingBitmap(bmp, 
            0, 0, 0, 0, bmp.width, bmp.height,
            Math.PI*4, AMPLITUDE, this.rotation);
        canvas.endSpriteBatching();

        const dx : number = canvas.width/2 - bmp.width/2;
        const dy : number = 8 + BASE_Y_OFF*this.logoYOffset;

        canvas.applyEffect(Effect.FixedColor);

        // White outlines
        canvas.setColor();
        for (let j : number = -2; j <= 2; ++ j) {

            for (let i : number = -2; i <= 2; ++ i) {

                if ((Math.abs(i) != 2 && Math.abs(j) != 2) ) {

                    continue;
                }
                canvas.drawSpriteBatch(dx + i, dy + j);
            }
        }

        // Black outlines
        canvas.setColor(0, 0, 0);
        for (let j : number = -1; j <= 1; ++ j) {

            for (let i : number = -1; i <= 1; ++ i) {

                if (i == 0 && j == 0) {

                    continue;
                }
                canvas.drawSpriteBatch(dx + i, dy + j);
            }
        }

        canvas.applyEffect(Effect.None);
        canvas.setColor();
        canvas.drawSpriteBatch(dx, dy);
    }


    public init(param : SceneParameter, event : ProgramEvent) : void {

        this.spaceTimer = 1.0;
        event.audio.fadeInMusic(event.assets.getSample("title"), TITLE_THEME_VOL);
    }


    public update(event : ProgramEvent) : void {

        const ROTATION_SPEED : number = Math.PI*2/120.0;
        const PLAYER_ROT_SPEED : number = Math.PI*2/210;
        const PRESS_SPACE_SPEED : number = 1.0/60.0;

        this.spritePlayer.animate(2, 0, 7, 4, event.tick);
        this.spriteGem.animate(1, 0, 3, 8, event.tick);

        this.rotation = (this.rotation + ROTATION_SPEED*event.tick) % (Math.PI*2);
        this.playerRadiusFactor = (this.playerRadiusFactor + PLAYER_ROT_SPEED*event.tick) % (Math.PI*2);

        this.logoYOffset = 0.0;
        if (event.transition.isActive()) {

            if (!event.transition.isFadingOut()) {

                this.logoYOffset = event.transition.getTimer();
            }
            return;
        }

        this.spaceTimer = (this.spaceTimer + PRESS_SPACE_SPEED*event.tick) % 1.0;
        if (event.input.getAction("start") == InputState.Pressed) {

            event.audio.stopMusic();
            event.audio.playSample(event.assets.getSample("start"), 0.60);
            event.transition.activate(true, TransitionType.Circle,
                1.0/30.0, (event : ProgramEvent) : void => {

                    event.transition.activate(false, TransitionType.Fade, 1.0/30.0);
                    event.scenes.changeScene("story", event);
                });
        }
        
    }


    public redraw(canvas : Canvas, assets : Assets, isCloningToBuffer : boolean = false): void {
        
        canvas.moveTo();
        canvas.clear(219, 109, 0);

        const spiralScale : number = Math.hypot(canvas.width/2, canvas.height/2);

        canvas.transform.setTarget(TransformTarget.Model);
        canvas.transform.push();
        canvas.transform.translate(canvas.width/2, canvas.height/2);
        canvas.transform.rotate(-this.rotation);
        canvas.transform.scale(spiralScale, spiralScale);
        canvas.transform.apply();

        canvas.setColor(255, 182, 0);
        canvas.drawMesh(this.meshSpiral);

        canvas.transform.pop();
        canvas.transform.apply();
        canvas.setColor();

        this.drawSpinningPlayer(canvas, assets);

        const font : Bitmap | undefined = assets.getBitmap("font_outlines");
        if (this.spaceTimer < 0.5) {

            canvas.drawText(font, this.pressSpaceStr, canvas.width/2, canvas.height - 56, -8, 0, Align.Center);
        }

        canvas.setColor(219, 255, 109);
        canvas.drawText(font, "(c) 2025 Jani Nykänen", canvas.width/2, canvas.height - 16, -8, 0, Align.Center);
        canvas.setColor();

        const bmpLogo : Bitmap | undefined = assets.getBitmap("logo");
        if (bmpLogo !== undefined) {

            this.drawLogo(canvas, bmpLogo);
        }
    }


    public dispose() : SceneParameter {
        
        return undefined;
    }

}

