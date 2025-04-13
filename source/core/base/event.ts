import { AudioPlayer } from "../../audio/interface.js";
import { Bitmap, Canvas, Flip, Mesh, Renderer } from "../../gfx/interface.js";
import { Localization } from "./localization.js";
import { Rectangle } from "../../common/rectangle.js";
import { Vector } from "../../common/vector.js";
import { ProgramEvent } from "../interface.js";
import { BaseSceneManager } from "./scenemanager.js";
import { BaseInput } from "./input.js";
import { BaseAssets } from "./assets.js";
import { BaseTransition } from "./transition.js";
import { MeshBuilder } from "../../meshbuilder/meshbuilder.js";


export class BaseProgramEvent implements ProgramEvent {


    private localizations : Map<string, Localization>;
    private activeLocalization : Localization | undefined = undefined;

    private cursorSpriteArea : Rectangle;
    private cursorCenter : Vector;
    private cursorBitmap : Bitmap | undefined = undefined;

    private readonly renderer : Renderer;

    public readonly input : BaseInput;
    public readonly audio : AudioPlayer;
    public readonly assets : BaseAssets;
    public readonly transition : BaseTransition;
    public readonly scenes : BaseSceneManager;


    public get screenWidth() : number {

        return this.renderer.canvasWidth;
    }


    public get screenHeight() : number {

        return this.renderer.canvasHeight;
    }


    public get localization() : Localization | undefined {
        
        return this.activeLocalization;
    }


    public get tick() : number {

        // 1.0 = 60 frames a second
        // TODO: Allow other framerates!
        return 1.0;
    }


    constructor(audio : AudioPlayer, renderer : Renderer) {

        this.input = new BaseInput();
        this.assets = new BaseAssets(this.audio, renderer);
        this.transition = new BaseTransition();
        this.scenes = new BaseSceneManager();

        this.audio = audio;
        this.renderer = renderer;

        this.localizations = new Map<string, Localization> ();

        // TODO: Unused, remove?
        this.cursorSpriteArea = new Rectangle(0, 0, 16, 16);
        this.cursorCenter = new Vector();
    }


    public addLocalizationJSON(key : string, jsonString : string) : void {

        this.localizations.set(key, new Localization(jsonString));
    }


    public setActiveLocalization(key : string) : void {

        this.activeLocalization = this.localizations.get(key);
    }


    public cloneCanvasToBufferTexture(forceRedraw : boolean = false) : void {

        if (forceRedraw) {

            this.renderer.drawToCanvas((canvas : Canvas) : void => {

                this.scenes.redraw(canvas, this.assets, true);
            });
        }
        this.renderer.cloneCanvasToBufferBitmap();
    }


    public createBitmapFromPixelData(pixels : Uint8Array, width : number, height : number) : Bitmap {

        return this.renderer.createBitmapFromPixelData(pixels, width, height);
    }


    public setCursorSprite(bmp : Bitmap | undefined, 
        sx : number = 0, sy : number = 0, 
        sw : number = bmp?.width ?? 16, sh : number = bmp?.height ?? 16,
        centerx : number = 0.0, centery : number = 0.0) : void {

        this.cursorBitmap ??= bmp;
        this.cursorSpriteArea = new Rectangle(sx, sy, sw, sh);
        this.cursorCenter = new Vector(centerx, centery);
    }


    public drawCursor(canvas : Canvas) : void {

        if (this.cursorBitmap === undefined) {

            return;
        }

        this.input.mouse.computeScaledPosition(this);

        const p : Vector = this.input.mouse.getCursorPosition();
        const dx : number = Math.round(p.x - this.cursorCenter.x);
        const dy : number = Math.round(p.y - this.cursorCenter.y);

        canvas.setColor();
        canvas.drawBitmap(this.cursorBitmap, Flip.None, dx, dy,
            this.cursorSpriteArea.x, this.cursorSpriteArea.y, 
            this.cursorSpriteArea.w, this.cursorSpriteArea.h);
    }


    public createMesh(vertices : number[], indices : number[], 
            textureCoords : number[] | undefined = undefined, 
            colors : number[] | undefined = undefined, 
            normals : number[] | undefined = undefined,
            dynamic : boolean = false) : Mesh {

        return this.renderer.createMesh(vertices, indices, textureCoords, colors, normals, dynamic);
    }


    public createMeshBuilder = () : MeshBuilder => new MeshBuilder(this.renderer);
}
