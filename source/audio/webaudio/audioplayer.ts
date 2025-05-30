import { clamp } from "../../common/mathutil.js";
import { AudioPlayer, AudioSample } from "../interface.js";
import { WebAudioSample } from "./sample.js";


export class WebAudioPlayer implements AudioPlayer {

    
    private ctx : AudioContext;
    private musicTrack : AudioSample | undefined = undefined;

    private soundVolume : number = 100;
    private musicVolume : number = 100;


    constructor(ctx : AudioContext, initialSoundVolume : number = 100, initialMusicVolume : number = 100) {

        this.ctx = ctx;
        this.soundVolume = initialSoundVolume;
        this.musicVolume = initialMusicVolume;
    }


    public playSample(sample : AudioSample | undefined, volume : number = 1.0) : void {

        const EPS : number = 0.001;

        if (this.ctx === undefined || this.soundVolume == 0 ||
            volume*(this.soundVolume/100) <= EPS) {

            return;
        }
        sample?.play(volume, this.soundVolume/100.0, false, 0);
    }


    public playMusic(sample : AudioSample | undefined, vol : number = 1.0) : void {

        if (sample === undefined) {
            
            return;
        }

        this.fadeInMusic(sample, vol);
    }


    public fadeInMusic(sample : AudioSample | undefined, volume : number = 1.0, fadeTime? : number) {

        if (this.ctx === undefined) {

            return;
        }

        // For some reason 0 fade time does not work
        fadeTime = Math.max(0.1, fadeTime ?? 0.0);

        if (this.musicTrack !== undefined) {

            this.musicTrack.stop();
            this.musicTrack = undefined;
        }

        sample?.fadeIn(fadeTime === undefined ? volume : Math.min(volume, 0.01), volume, 
            this.musicVolume/100.0, 
            true, 0, fadeTime ?? 0);
        this.musicTrack = sample;
    }


    public fadeOutMusic(time : number) : void {
        
        if (this.ctx === undefined || this.musicTrack === undefined) {

            return;
        }

        this.musicTrack.fadeOut(time);
    }


    public pauseMusic() : void {

        if (this.ctx === undefined || this.musicTrack === undefined) {
            
            return;
        }
        this.musicTrack.pause();
    }


    public resumeMusic(newVolume? : number) : boolean {

        if (this.ctx === undefined || this.musicTrack === undefined) {

            return false;
        }

        this.musicTrack.resume(this.musicVolume/100.0, newVolume);
        return true;
    }


    public stopMusic() : void {

        this.musicTrack?.stop();
        this.musicTrack = undefined;
    }


    public setGlobalSoundVolume(vol : number) : void {

        this.soundVolume = clamp(vol, 0, 100);
    }


    public setGlobalMusicVolume(vol : number) : void {

        this.musicVolume = clamp(vol, 0, 100);
        this.musicTrack?.changeVolume(this.musicVolume/100.0);
    }


    public setMusicTrackVolume(vol : number) : void {

        this.musicTrack?.changeVolume(vol);
    }


    public getGlobalSoundVolume = () : number => this.soundVolume;
    public getGlobalMusicVolume = () : number => this.musicVolume;


    public decodeSample(sampleData : ArrayBuffer, callback : (s : AudioSample) => any) : void {

        if (this.ctx === undefined) {

            return;
        }

        this.ctx.decodeAudioData(sampleData, (data : AudioBuffer) => {

            callback(new WebAudioSample(this.ctx!, data));
        });
    }


    public isMusicPlaying = () : boolean => this.musicTrack !== undefined;
}
