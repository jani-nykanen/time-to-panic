import { AudioPlayer, AudioSample } from "../audio/interface.js";
import { RGBA } from "../common/rgba.js";
import { Vector } from "../common/vector.js";
import { Bitmap, Canvas, Mesh } from "../gfx/interface.js";
import { Tilemap } from "../tilemap/tilemap.js";
import { MeshBuilder } from "../meshbuilder/meshbuilder.js";

export const enum InputState {

    Up = 0,
    Down = 1,
    Released = 2,
    Pressed = 3,

    DownOrPressed = 1
};


export const enum TransitionType {
    None = 0,
    Fade = 1,
    Circle = 2,
    Waves = 3,
};


export type SceneParameter = number | string | undefined;


export interface Keyboard {

    getKeyState(name : string) : InputState;
    
    isAnyPressed() : boolean;
    wasUsed() : boolean;
    
    // preventKey(key : string) : void;
    // flush() : void;
}


export interface Mouse {

    getButtonState(button : number) : InputState;
    getCursorPosition() : Vector;
    getCursorUnitPosition() : Vector;

    isAnyPressed() : boolean;
    wasUsed() : boolean;
}


export interface GamePad {

    getStick(index ? : number) : Vector;
    getButtonState(index : number) : InputState;
}


export interface Input {

    get keyboard() : Keyboard;
    get mouse() : Mouse;
    get gamepad() : GamePad;
    get stick() : Vector;

    addAction(name : string, 
        keys : Array<string>, 
        gamepadButtons? : Array<number> | undefined, 
        mouseButtons? : Array<number> | undefined,
        prevent? : boolean) : void;
    getAction(name : string) : InputState;

    upPress() : boolean;
    downPress() : boolean;
    leftPress() : boolean;
    rightPress() : boolean;
    
    isAnyPressed() : boolean;
    isKeyboardAndMouseActive() : boolean;
    isGamepadActive() : boolean;
}


export interface Assets {

    getBitmap(name : string) : Bitmap | undefined;
    getSample(name : string) : AudioSample | undefined;
    getDocument(name : string) : string | undefined;
    getMesh(name : string) : Mesh | undefined;
    getTilemap(name : string) : Tilemap | undefined;

    addMesh(name : string, mesh : Mesh) : void;

    parseIndexFile(path : string) : void;
}


export interface Scene {
    
    init?(param : SceneParameter, event : ProgramEvent) : void;
    update(event : ProgramEvent) : void;
    redraw(canvas : Canvas, assets : Assets, isCloningToBuffer? : boolean) : void;
    postDraw?(canvas : Canvas, assets : Assets) : void;
    dispose() : SceneParameter;
}


export interface SceneManager {

    addScene(name : string, scene : Scene, makeActive? : boolean) : void;
    changeScene(name : string, event : ProgramEvent) : void;
}


export interface Transition {

    activate(fadeOut : boolean, type : TransitionType, speed : number, 
        callback? : ((event : ProgramEvent) => any) | undefined, 
        color? : RGBA, center? : Vector | undefined) : void;
    deactivate() : void;

    isActive() : boolean;
    isFadingOut() : boolean;
    getEffectType() : TransitionType ;
    getTimer() : number;
    getColor() : RGBA;

    setCenter(pos : Vector) : void;
    changeSpeed(newSpeed : number) : void;
}


export interface ProgramEvent {

    get tick() : number;
    
    get assets() : Assets;
    get input() : Input;
    get scenes() : SceneManager;
    get audio() : AudioPlayer;

    get screenWidth() : number;
    get screenHeight() : number;

    cloneCanvasToBufferTexture(forceRedraw? : boolean) : void;

    addLocalizationJSON(key : string, jsonString : string) : void;
    setActiveLocalization(key : string) : void;

    createMesh(vertices : number[], indices : number[], 
            textureCoords? : number[], colors? : number[], 
            normals? : number[], dynamic? : boolean) : Mesh;
    createMeshBuilder() : MeshBuilder;
}


export interface Program {

    run(initialEvent? : (event : ProgramEvent) => void,
        onload? : (event : ProgramEvent) => void,
        errorEvent? : (e : Error) => void) : void;
}
