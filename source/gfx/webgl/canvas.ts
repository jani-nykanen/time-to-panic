import { RGBA } from "../../common/rgba.js";
import { Vector } from "../../common/vector.js";
import { Mesh, Align, Bitmap, Canvas, Effect, Flip, Transform } from "../interface.js";
import { WebGLBitmap } from "./bitmap.js";
import { WebGLMesh } from "./mesh.js";
import { createRectangleMesh, ShaderType, StencilCondition, StencilOperation, WebGLRenderer } from "./renderer.js";
import { SpriteBatch } from "./spritebatch.js";


const createCircleOutMesh = (gl : WebGLRenderingContext, quality : number) : Mesh => {

    const step : number = Math.PI*2/quality;

    const vertices : number[] = new Array<number> ();
    const indices : number[] = new Array<number> ();
    const colors : number[] = (new Array<number> (quality*6*4)).fill(1.0);

    let index : number = 0;

    for (let i : number = 0; i < quality; ++ i) {

        const angle1 : number = step*i;
        const angle2 : number = step*(i + 1);

        const c1 : number = Math.cos(angle1);
        const c2 : number = Math.cos(angle2);

        const s1 : number = Math.sin(angle1);
        const s2 : number = Math.sin(angle2);

        vertices.push(
            c1, s1, 0,
            c2, s2, 0,
            c2*2, s2*2, 0,

            c2*2, s2*2, 0,
            c1*2, s1*2, 0,
            c1, s1, 0);

        for (let j : number = 0; j < 6; ++ j) {

            indices.push(index ++);
        }
    }

    return new WebGLMesh(gl, 
        new Float32Array(vertices), 
        new Uint16Array(indices),
        undefined,
        new Float32Array(colors));
}



const createCircleMesh = (gl : WebGLRenderingContext, quality : number) : Mesh => {

    const step : number = Math.PI*2/quality;

    const vertices : number[] = new Array<number> ();
    const indices : number[] = new Array<number> ();
    const colors : number[] = (new Array<number> (quality*6*4)).fill(1.0);

    let index : number = 0;

    for (let i : number = 0; i < quality; ++ i) {

        const angle1 : number = step*i;
        const angle2 : number = step*(i + 1);

        const c1 : number = Math.cos(angle1);
        const c2 : number = Math.cos(angle2);

        const s1 : number = Math.sin(angle1);
        const s2 : number = Math.sin(angle2);

        vertices.push(
            0, 0, 0,
            c1, s1, 0,
            c2, s2, 0);

        for (let j : number = 0; j < 3; ++ j) {

            indices.push(index ++);
        }
    }

    return new WebGLMesh(gl, 
        new Float32Array(vertices), 
        new Uint16Array(indices),
        undefined,
        new Float32Array(colors));
}


const createEquiangularTriangleMesh = (gl : WebGLRenderingContext) : Mesh => {

    const p : number = Math.SQRT1_2;

    return new WebGLMesh(gl,
        new Float32Array([
            -p, -p, 0,
            p, -p, 0, 
            0, 1, 0
        ]),
        new Uint16Array([0, 1, 2]),
        undefined,
        new Float32Array([
            1.0, 1.0, 1.0, 1.0, 
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0]) 
        );
}


const getShaderTypeFromEffect = (eff : Effect, textured : boolean = true) : ShaderType => 
    [textured ? ShaderType.Textured : ShaderType.NoTexture, 
     ShaderType.FixedColorTextured, 
     ShaderType.InvertTextured,
     ShaderType.BlackAndWhite,
     textured ? ShaderType.TexturedLighting : ShaderType.NoTextureLighting]
     [eff] ?? ShaderType.Textured;


/*
 * TODO: Possibly merge with "renderer"?
 */
export class WebGLCanvas implements Canvas {


    private framebuffer : WebGLBitmap | undefined;
    private cloneTexture : WebGLBitmap | undefined;

    private meshRectangle : Mesh;
    private meshCircleOut : Mesh;
    private meshCircle : Mesh;
    private meshEquiangularTriangle : Mesh;

    private batch : SpriteBatch;
    private batchingEnabled : boolean = false;
    private batchTexture : Bitmap | undefined = undefined;

    private activeEffect : Effect = Effect.None;
    private activeColor : RGBA;

    private translation : Vector = new Vector(0, 0);
    private translationActive : boolean = true;

    private depthValue : number = 0.0;

    private readonly renderer : WebGLRenderer;


    public readonly transform: Transform;


    get width() : number {

        return this.framebuffer?.width ?? this.renderer.width;
    }


    get height() : number {

        return this.framebuffer?.height ?? this.renderer.height;
    }


    constructor(renderer : WebGLRenderer, 
        transform : Transform, gl : WebGLRenderingContext,
        width? : number, height? : number, linearFilter? : boolean) {

        if (width === undefined || height === undefined) {

            this.framebuffer = undefined;
            this.cloneTexture = undefined;
        }
        else {

            this.framebuffer = new WebGLBitmap(gl, undefined, linearFilter ?? false, false, false, true, width, height);
            this.cloneTexture = new WebGLBitmap(gl, undefined, linearFilter ?? false, false, false, true, width, height);
        }

        this.renderer = renderer;
        this.transform = transform;

        this.meshRectangle = createRectangleMesh(gl);
        this.meshCircleOut = createCircleOutMesh(gl, 64);
        this.meshCircle = createCircleMesh(gl, 64);
        this.meshEquiangularTriangle = createEquiangularTriangleMesh(gl);
        
        this.batch = new SpriteBatch(gl, 1024);

        this.activeColor = new RGBA();

        // TODO: TEMPORARY PLACE, add function "hideCursor"
        // document.body.style.setProperty("cursor", "none");
    }


    public clear(r : number = 0, g : number = 0, b : number = 0) : void {

        this.renderer.clear(r/255.0, g/255.0, b/255.0);
    }


    public clearF(r : number = 0.0, g : number = 0.0, b : number = 0.0) : void {

        this.renderer.clear(r, g, b);
    }


    public fillRect(dx : number = 0, dy : number = 0, dw : number = this.width, dh : number = this.height) : void {

        dx = (dx + this.translation.x) | 0;
        dy = (dy + this.translation.y) | 0;

        if (this.batchingEnabled) {

            this.batch.pushSprite(0, 0, 1, 1, dx, dy, dw, dh, this.depthValue, this.activeColor);
            return;
        }

        this.renderer.changeShader(ShaderType.NoTexture);
        this.renderer.setVertexTransform(dx, dy, this.depthValue, dw, dh, 1);
        this.renderer.drawMesh(this.meshRectangle);
    }


    public drawMesh(mesh : Mesh | undefined, texture : Bitmap | undefined = undefined,
        dx : number = 0.0, dy : number = 0.0, dz : number = 0.0, 
        scalex : number = 1.0, scaley : number = 1.0, scalez : number = 1.0) : void {

        if (mesh === undefined) {

            return;
        }

        this.renderer.changeShader(getShaderTypeFromEffect(this.activeEffect, texture !== undefined));
        if (texture !== undefined) {

            this.renderer.bindTexture(texture);
        }

        this.renderer.setVertexTransform(dx, dy, dz, scalex, scaley, scalez);
        this.renderer.setFragmenTransform(0, 0, 1, 1);
        this.renderer.drawMesh(mesh)
    }


    public drawBitmap(bmp : Bitmap | undefined, flip : Flip = Flip.None, 
        dx : number = 0.0, dy : number = 0.0, 
        sx : number = 0.0, sy : number = 0.0, 
        sw : number = bmp?.width ?? 0, sh : number = bmp?.height ?? 0, 
        dw : number = sw, dh : number = sh) : void {
        
        bmp ??= this.batchTexture;
        if (bmp === undefined) {

            return;
        }

        if (this.translationActive) {

            dx += this.translation.x;
            dy += this.translation.y;
        }

        dx |= 0;
        dy |= 0;
        dw |= 0;
        dh |= 0;

        if ((flip & Flip.Horizontal) == Flip.Horizontal) {

            dx += dw;
            dw *= -1;
        }

        if ((flip & Flip.Vertical) == Flip.Vertical) {

            dy += dh;
            dh *= -1;
        }

        sx /= bmp.width;
        sy /= bmp.height;
        sw /= bmp.width;
        sh /= bmp.height;

        if (this.batchingEnabled) {

            this.batch.pushSprite(sx, sy, sw, sh, dx, dy, dw, dh, this.depthValue,
                this.activeColor);
            return;
        }

        this.renderer.changeShader(getShaderTypeFromEffect(this.activeEffect));
        this.renderer.setVertexTransform(dx, dy, this.depthValue, dw, dh, 1);
        this.renderer.setFragmenTransform(sx, sy, sw, sh);

        this.renderer.bindTexture(bmp);
        this.renderer.drawMesh(this.meshRectangle);
    }


    public drawText(font : Bitmap | undefined, text : string, 
        dx : number, dy : number, xoff : number = 0, yoff : number = 0, 
        align : Align = Align.Left, scalex : number = 1.0, scaley : number = 1.0) : void {

        font ??= this.batchTexture;
        if (font === undefined) {

            return;
        }

        const cw : number = (font.width / 16) | 0;
        const ch : number = cw;

        let x : number = dx;
        let y : number = dy;

        if (align == Align.Center) {

            dx -= (text.length + 1)*(cw + xoff)*scalex/2.0;
            x = dx;
        }
        else if (align == Align.Right) {
            
            dx -= ((text.length + 1)*(cw + xoff))*scalex;
            x = dx;
        }

        const useBatch : boolean = !this.batchingEnabled;
        if (useBatch) {

            this.beginSpriteBatching(font);
        }

        for (let i : number = 0; i < text.length; ++ i) {

            const chr : number = text.charCodeAt(i);
            if (chr == '\n'.charCodeAt(0)) {

                x = dx;
                y += (ch + yoff) * scaley;
                continue;
            }

            this.drawBitmap(font, Flip.None, 
                x, y, (chr % 16)*cw, ((chr/16) | 0)*ch, 
                cw, ch, cw*scalex, ch*scaley);

            x += (cw + xoff) * scalex;
        }

        if (useBatch) {

            this.endSpriteBatching();
            this.drawSpriteBatch();
        }
    }


    public fillCircleOutside(centerx : number, centery : number, radius : number) : void {

        if (this.translationActive) {

            centerx += this.translation.x;
            centery += this.translation.y;
        }

        this.renderer.changeShader(ShaderType.NoTexture);

        // Center
        this.renderer.setVertexTransform(centerx, centery, this.depthValue, radius, radius, 1);
        this.renderer.drawMesh(this.meshCircleOut);

        // Borders

        const top : number = Math.max(0, centery - radius) | 0;
        const bottom : number = Math.min(this.height, centery + radius) | 0;
        const left : number = Math.max(centerx - radius, 0) | 0;
        const right : number = Math.min(centerx + radius, this.width) | 0;

        // This is a workaround, okay?
        let oldTrX : number = this.translation.x;
        let oldTrY : number = this.translation.y;

        this.translation.zero();

        if (top > 0)
            this.fillRect(0, 0, this.width, top);
        if (bottom < this.height)
            this.fillRect(0, bottom, this.width, this.height - bottom);
        if (left > 0)
            this.fillRect(0, 0, left, this.height);
        if (right < this.width)
            this.fillRect(right, 0, this.width - right, this.height);

        this.translation.x = oldTrX;
        this.translation.y = oldTrY;
    }


    public fillEllipse(centerx : number, centery : number, width : number, height : number) : void{

        if (this.translationActive) {

            centerx += this.translation.x;
            centery += this.translation.y;
        }

        this.renderer.changeShader(ShaderType.NoTexture);
        this.renderer.setVertexTransform(centerx, centery, this.depthValue, width/2, height/2, 1);
        this.renderer.drawMesh(this.meshCircle);
    }


    public fillEquiangularTriangle(centerx : number, centery : number, width : number, height : number) : void {

        if (this.translationActive) {

            centerx += this.translation.x;
            centery += this.translation.y;
        }

        this.renderer.changeShader(ShaderType.NoTexture);
        this.renderer.setVertexTransform(centerx, centery, this.depthValue, width/2, height/2, 1);
        this.renderer.drawMesh(this.meshEquiangularTriangle);
    }
    

    public drawHorizontallyWavingBitmap(bitmap : Bitmap | undefined, 
        amplitude : number, period : number, shift : number, flip : Flip = Flip.None,
        dx : number = 0, dy : number = 0, sx : number = 0, sy : number = 0,
        sw : number | undefined = bitmap?.width, sh : number | undefined = bitmap?.height) : void {

        bitmap ??= this.batchTexture;
        if (bitmap === undefined) {

            return;
        }
            
        // Note: For better performance one should obviously do this in
        // a shader, but I'm lazy

        // TODO: Automaticall use sprite batch if not enabled
        // for a better performance

        const useBatch : boolean = !this.batchingEnabled;
        if (useBatch) {

            this.beginSpriteBatching(bitmap);
        }

        const phaseStep : number = Math.PI*2/period;

        for (let y : number = 0; y < sh!; ++ y) {

            const phase : number = shift + phaseStep*y;
            const x : number = dx + Math.sin(phase)*amplitude;
            const py : number = (flip & Flip.Vertical) != 0 ? (sh! - 1) - y : y;

            this.drawBitmap(bitmap, Flip.Horizontal & flip, x, dy + y, sx, sy! + py, sw!, 1);
        }

        if (useBatch) {

            this.endSpriteBatching();
            this.drawSpriteBatch();
        }
    }


    public drawVerticallyWavingBitmap(bmp : Bitmap | undefined,
        dx : number, dy : number, sx : number, sy : number, sw : number, sh : number,
        period : number, amplitude : number, shift : number) : void {

        const useBatch : boolean = !this.batchingEnabled;
        if (useBatch) {

            this.beginSpriteBatching(bmp);
        }

        for (let x = 0; x < sw; ++ x) {

            const t : number = shift + (x/sw)*period;
            const y : number = Math.round(Math.sin(t)*amplitude);

            this.drawBitmap(bmp, Flip.None, dx + x, dy + y, sx + x, sy, 1, sh);
        }

        if (useBatch) {

            this.endSpriteBatching();
            this.drawSpriteBatch();
        }
    }


    public drawFunnilyAppearingBitmap(bmp : Bitmap | undefined, flip : Flip,
        dx : number, dy : number, sx : number, sy : number, sw : number, sh : number,
        t : number, amplitude : number, latitude : number, maxOffset : number) : void {

        const offset : number = 1 + maxOffset * t;

        const useBatch : boolean = !this.batchingEnabled;
        if (useBatch) {

            this.beginSpriteBatching(bmp);
        }

        for (let y : number = 0; y < sh; ++ y) {

            this.drawBitmap(bmp, flip,
                (dx + Math.sin((Math.PI*2*latitude)/sh*y + t*(Math.PI*latitude))*amplitude*t), 
                (dy + y*offset - sh*maxOffset*t/2),
                sx, sy + y, sw, 1);
        }

        if (useBatch) {

            this.endSpriteBatching();
            this.drawSpriteBatch();
        }
    }


    public setColor(r : number = 255, g : number = 255, b : number = 255, a : number = 1.0) : void {

        this.setColorF(r/255.0, g/255.0, b/255.0, a);
    }


    public setColorF(r : number = 1.0, g : number = 1.0, b : number = 1.0, a : number = 1.0) : void {

        this.activeColor.r = r;
        this.activeColor.g = g;
        this.activeColor.b = b;
        this.activeColor.a = a;

        this.renderer.setColor(r, g, b, a);
    }


    public setAlpha(alpha : number = 1.0) : void {

        this.activeColor.a = alpha;

        this.renderer.setAlpha(alpha);
    }


    public applyEffect(eff : Effect = Effect.None) : void {

        this.activeEffect = eff;
    }


    public flushSpriteBatch() : void {

        this.batchingEnabled = false;
        this.batch.flush();
    }


    public beginSpriteBatching(texture : Bitmap | undefined = undefined) : void {

        this.batchingEnabled = true;
        this.batch.flush();

        this.batchTexture = texture;
    }


    public endSpriteBatching() : void {

        this.batch.prepareMesh();
        this.batchingEnabled = false;
    }


    public drawSpriteBatch(dx : number = 0.0, dy : number = 0.0) : void {

        if (!this.batch.anythingToDraw()) {

            return;
        }

        this.renderer.changeShader(getShaderTypeFromEffect(this.activeEffect));
        this.renderer.setVertexTransform(dx | 0, dy | 0, this.depthValue, 1.0, 1.0, 1.0);
        this.renderer.setFragmenTransform(0, 0, 1, 1);

        this.renderer.bindTexture(this.batchTexture as WebGLBitmap);
        this.renderer.drawMesh(this.batch.outputMesh);
    }


    public toggleShadowRendering(state : boolean = false) : void {

        this.renderer.toggleStencilTest(state);
        if (state) {

            this.renderer.clearStencilBuffer();
            this.renderer.setStencilOperation(StencilOperation.Keep);
            this.renderer.setStencilCondition(StencilCondition.NotEqual);
        }
    }

    
    public clearShadowBuffer() : void {

        this.renderer.clearStencilBuffer();
    }


    public setRenderTarget() : void {

        this.framebuffer?.setRenderTarget();
    }


    public bind() : void {

        this.framebuffer?.bind();
    }


    public getCloneBufferBitmap = () : Bitmap | undefined => this.cloneTexture;


    public cloneToBufferBitmap() : void {

        if (this.framebuffer === undefined || this.cloneTexture === undefined) {

            return;
        }
        this.renderer.nullActiveBitmap();
        this.framebuffer.cloneToBitmap(this.cloneTexture);
    }


    public recreate(gl : WebGLRenderingContext, newWidth : number, newHeight : number) : void {

        if (this.framebuffer === undefined) {

            return;
        }

        this.framebuffer?.dispose();
        this.cloneTexture?.dispose();

        this.framebuffer = new WebGLBitmap(gl, undefined, false, false, false, true, newWidth, newHeight);
        this.cloneTexture = new WebGLBitmap(gl, undefined, false, false, false, true, newWidth, newHeight);
    }


    public move(x : number, y : number) : void {
        
        this.translation.x += x;
        this.translation.y += y;
    }


    public moveTo(x : number = 0.0, y : number = 0.0) : void {

        this.translation.x = x;
        this.translation.y = y;
    }


    public toggleTranslation(state : boolean = true) : void {

        this.translationActive = state;
    }


    public toggleDepthTesting(state : boolean = true) : void {

        this.renderer.toggleDepthTesting(state);
    }


    public clearDepth() : void {

        this.renderer.clearDepth();
    }


    public setDepthValue(z : number = 0.0): void {
        
        this.depthValue = z;
    }


    public getTranslation = () : Vector => this.translation.clone();
    public hasFramebuffer = () : boolean => this.framebuffer !== undefined;

    
    public setLighting(direction : Vector, magnitude : number) : void {

        this.renderer.setLighting(Vector.normalize(direction), magnitude);
    }
}
