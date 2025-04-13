import { Vector } from "../common/vector.js";


export const enum Flip {

    None = 0,
    Horizontal = 1,
    Vertical = 2,
}


export const enum Align {

    Left = 0,
    Right = 1,
    Center = 2
}


export const enum TransformTarget {

    Model = 0,
    Camera = 1,
    Projection = 2,
}


export const enum Effect {

    None = 0,
    FixedColor = 1,
    InvertColors = 2,
    BlackAndWhite = 3,
    Lighting = 4,
}


export interface Bitmap {

    get width() : number;
    get height() : number;

    bind() : void;
}


export interface Mesh {

    bind() : void;
    draw() : void;
    dispose() : void;
}


export interface Transform {

    get viewSize() : Vector

    setTarget(target : TransformTarget) : void;

    loadIdentity() : void;
    translate(x : number, y : number, z? : number) : void;
    scale(x : number, y : number, z? : number) : void;
    rotate(angle : number, x? : number, y? : number, z? : number) : void;
    operateBasis(v1 : Vector, v2 : Vector, v3? : Vector) : void;
    mirror(x : -1 | 1, y : -1 | 1, z : -1 | 1) : void;

    view2D(width : number, height : number) : void;
    fitDimension(dimension : number, width : number, height : number) : void;

    lookAt(eye : Vector, target : Vector, up? : Vector) : void;
    perspective(fovY : number, aspectRatio : number, near : number, far : number) : void;
    ortho(left : number, right : number, bottom : number, top : number, 
        near? : number, far? : number) : void;

    push() : void;
    pop() : void;

    apply() : void;
}


export interface Canvas {

    get width() : number;
    get height() : number;

    readonly transform : Transform; // TODO: This vs. get

    clear(r? : number, g? : number, b? : number) : void;
    clearF(r? : number, g? : number, b? : number) : void;
    
    drawMesh(mesh : Mesh | undefined, texture? : Bitmap | undefined,
        dx? : number, dy? : number, dz? : number, 
        scalex? : number, scaley? : number, scalez? : number) : void;

    drawBitmap(bmp : Bitmap | undefined, flip? : Flip, 
        dx? : number, dy? : number, 
        sx? : number, sy? : number,
        sw? : number, sh? : number,
        dw? : number, dh? : number,
        rotation? : number, center? : Vector) : void;
    drawText(font : Bitmap | undefined, text : string, 
        dx : number, dy : number, xoff? : number, yoff? : number, 
        align? : Align, scalex? : number, scaley? : number) : void;

    drawHorizontallyWavingBitmap(bitmap : Bitmap | undefined, 
        amplitude : number, period : number, shift : number,
        flip? : Flip, dx? : number, dy? : number, 
        sx? : number, sy? : number,
        sw? : number | undefined, sh? : number | undefined) : void;
    drawVerticallyWavingBitmap(bmp : Bitmap | undefined,
        dx : number, dy : number,
        sx : number, sy : number, sw : number, sh : number,
        period : number, amplitude : number,
        shift : number) : void;
    drawFunnilyAppearingBitmap(bmp : Bitmap | undefined, flip : Flip,
        dx : number, dy : number, sx : number, sy : number, sw : number, sh : number,
        t : number, amplitude : number, latitude : number, maxOffset : number) : void

    fillRect(dx? : number, dy? : number, dw? : number, dh? : number) : void;
    fillEllipse(centerx : number, centery : number, width : number, height : number) : void;
    fillCircleOutside(centerx : number, centery : number, radius : number) : void;
    fillEquiangularTriangle(centerx : number, centery : number, width : number, height : number) : void;

    setColor(r? : number, g? : number, b? : number, a? : number) : void;
    setColorF(r? : number, g? : number, b? : number, a? : number) : void;
    setAlpha(a? : number) : void;
    applyEffect(eff? : Effect) : void;

    flushSpriteBatch() : void;
    beginSpriteBatching(texture : Bitmap | undefined) : void;
    endSpriteBatching() : void;
    drawSpriteBatch(dx? : number, dy? : number) : void;

    toggleShadowRendering(state? : boolean) : void;
    clearShadowBuffer() : void;

    getCloneBufferBitmap() : Bitmap | undefined;

    move(x : number, y : number) : void;
    moveTo(x? : number, y? : number) : void;

    toggleDepthTesting(state? : boolean) : void
    clearDepth() : void;
    setDepthValue(z? : number) : void;

    toggleTranslation(state? : boolean) : void;
    getTranslation() : Vector;

    setLighting(direction : Vector, magnitude : number) : void;
}


export interface Renderer {
    
    get width() : number;
    get height() : number;

    get canvasWidth() : number;
    get canvasHeight() : number;

    resize(width : number, height : number) : void;

    drawToCanvas(cb : (canvas : Canvas) => void) : void;
    refresh() : void;

    createBitmap(img : HTMLImageElement, 
        linearFilter? : boolean, 
        repeatx? : boolean, repeaty? : boolean) : Bitmap;
    createMesh(vertices : number[], indices : number[], 
        textureCoords? : number[], colors? : number[], normals? : number[],
        dynamic? : boolean) : Mesh;

    cloneCanvasToBufferBitmap() : void;

    createBitmapFromPixelData(pixels : Uint8Array, width : number, height : number) : Bitmap;
}       
