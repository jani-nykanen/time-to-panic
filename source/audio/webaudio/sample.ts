import { clamp } from "../../common/mathutil.js";
import { AudioSample } from "../interface.js";


const MINIMUM_VOLUME : number = 0.001;


export class WebAudioSample implements AudioSample {


    private data : AudioBuffer;
    private activeBuffer : AudioBufferSourceNode | undefined = undefined;
    private gain : GainNode;

    private startTime : number = 0.0;
    private pauseTime : number = 0.0;
    private baseVolume : number = 0.0;
    private loop : boolean = false;

    private readonly ctx : AudioContext;


    constructor(ctx : AudioContext, data : AudioBuffer) {

        this.data = data;
        this.gain = ctx.createGain();

        this.ctx = ctx;
    }


    public play(volume : number = 1.0, volumeModifier : number = 1.0,
        loop : boolean = false, startTime : number = 0.0) : void {

        this.fadeIn(volume, volume, volumeModifier, loop, startTime, 0);
    }


    public fadeIn(initial : number, end : number, volumeModifier : number,
        loop : boolean = false, startTime: number = 0, fadeTime: number = 0) : void {

        this.activeBuffer?.disconnect();
        this.activeBuffer = undefined;

        const bufferSource : AudioBufferSourceNode = this.ctx.createBufferSource();
        bufferSource.buffer = this.data;
        bufferSource.loop = loop;

        this.baseVolume = end;

        initial = clamp(initial*volumeModifier, MINIMUM_VOLUME, 1.0);
        end = clamp(end*volumeModifier, MINIMUM_VOLUME, 1.0);

        if (fadeTime > 0) {

            this.gain.gain.setValueAtTime(initial, startTime);
            this.gain.gain.exponentialRampToValueAtTime(end, startTime + fadeTime/1000.0);
        }
        else {

            this.gain.gain.setValueAtTime(end, startTime);
        }

        this.startTime = this.ctx.currentTime - startTime;
        this.pauseTime = 0;
        this.loop = loop;

        bufferSource.connect(this.gain).connect(this.ctx.destination);
        bufferSource.start(0, startTime);

        this.activeBuffer = bufferSource;
    }


    public fadeOut(time : number) : void {

        throw new Error("Not implemented yet!");
    }


    public stop() : void {

        this.activeBuffer?.disconnect();
        this.activeBuffer?.stop();
        this.activeBuffer = undefined;
    }


    public pause() : void {

        if (this.activeBuffer === undefined)  {

            return;
        }

        this.pauseTime = this.ctx.currentTime - this.startTime;
        this.stop();
    }


    public resume(volumeModifier : number, newVolume? : number) : void {

        this.play(newVolume ?? this.baseVolume, volumeModifier, this.loop, this.pauseTime);
    }


    public changeVolume(newVolume : number) : void {

        if (this.activeBuffer === undefined)  {
            
            return;
        }
        this.gain.gain.setValueAtTime(clamp(this.baseVolume*newVolume, MINIMUM_VOLUME, 1.0), this.ctx.currentTime);
    }
}
