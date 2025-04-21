import { Vector } from "../common/vector.js";
import { Assets, InputState, ProgramEvent, Scene, SceneParameter, TransitionType } from "../core/interface.js";
import { Align, Bitmap, Canvas, Effect, Flip, Mesh, TransformTarget } from "../gfx/interface.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { MeshBuilder } from "../meshbuilder/meshbuilder.js";
import { TextBox } from "../ui/textbox.js";
import { addCube } from "../meshbuilder/cube.js";
import { RGBA } from "../common/rgba.js";
import { Rectangle } from "../common/rectangle.js";


export class IntroScene implements Scene {


    private phase : number = 0;
    private phaseTimer : number = 0;

    private meshCube : Mesh;
    private cubeRotation : number = 0.0;
    private cubeScale : number = 1.0;


    constructor(event : ProgramEvent)  {

        const builder : MeshBuilder = event.createMeshBuilder();

        addCube(builder, new Vector(), 1.0, RGBA.white, new Rectangle(0, 0, 1, 1));

        this.meshCube = builder.build();
    }


    private drawSpinningCube(canvas : Canvas, assets : Assets) : void {

        const YOFF : number = 0.5;

        const bmpAvatar : Bitmap = assets.getBitmap("avatar");
        
        canvas.transform.setTarget(TransformTarget.Projection);
        canvas.transform.perspective(60.0, canvas.width/canvas.height, 0.1, 100.0);

        canvas.transform.setTarget(TransformTarget.Camera);
        canvas.transform.lookAt(new Vector(0, YOFF + -1, -3), new Vector(0, YOFF, 0));

        canvas.transform.setTarget(TransformTarget.Model);
        canvas.transform.rotate(this.cubeRotation, 1.0, -1.0, 0.0);
        canvas.transform.scale(this.cubeScale, this.cubeScale, this.cubeScale);

        canvas.transform.apply();

        canvas.applyEffect(Effect.Lighting);
        canvas.setLighting(new Vector(0, -1, -1), 0.50);

        canvas.setColor();
        canvas.toggleDepthTesting(true);
        canvas.clearDepth();

        canvas.drawMesh(this.meshCube, bmpAvatar);

        canvas.transform.setDefault2DView(canvas.width, canvas.height);
        canvas.toggleDepthTesting(false);
        canvas.applyEffect(Effect.None);
    }


    public init(param : SceneParameter, event : ProgramEvent) : void {

        event.transition.activate(false, TransitionType.Fade, 1.0/30.0);
    }


    public update(event : ProgramEvent) : void {

        const PHASE_TIME : number = 90;
        const CUBE_ROTATION_SPEED : number = Math.PI*2/180.0;

        this.cubeRotation = (this.cubeRotation + CUBE_ROTATION_SPEED*event.tick) % (Math.PI*2);
        this.cubeScale = 1.0;

        if (event.transition.isActive()) {

            this.cubeScale = event.transition.getTimer();
            if (!event.transition.isFadingOut()) {

               this.cubeScale = 1.0 - this.cubeScale;
            }

            return;
        }

        this.phaseTimer += event.tick;
        if (this.phaseTimer >= PHASE_TIME || event.input.isAnyPressed()) {

            event.transition.activate(true, TransitionType.Fade, 1.0/20.0, 
                (event : ProgramEvent) : void => {

                    ++ this.phase;
                    this.phaseTimer -= PHASE_TIME;
                    if (this.phase == 2) {

                        event.scenes.changeScene("titlescreen", event);
                        event.transition.activate(false, TransitionType.Circle, 1.0/30.0);
                    }
                }
            );
        }
    }


    public redraw(canvas : Canvas, assets : Assets, isCloningToBuffer : boolean = false): void {
        
        canvas.moveTo();
        canvas.clear(0, 0, 0);

        const bmpIntro : Bitmap | undefined = assets.getBitmap("intro");
        if (bmpIntro === undefined) {

            return;
        }

        if (this.phase == 0) {

            this.drawSpinningCube(canvas, assets);
            canvas.moveTo(0, 64);
        }

        canvas.drawBitmap(bmpIntro, Flip.None, 
            canvas.width/2 - bmpIntro.width/2, canvas.height/2 - bmpIntro.height/3, 
            0, this.phase*bmpIntro.height/2, 
            bmpIntro.width, bmpIntro.height/2);
        canvas.moveTo();
    }


    public dispose() : SceneParameter {
        
        return undefined;
    }

}

