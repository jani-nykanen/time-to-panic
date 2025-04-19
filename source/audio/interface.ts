

export interface AudioSample {

    play(volume? : number, volumeModifier? : number, loop? : boolean, startTime? : number) : void;
    fadeIn(initial : number, end : number, volumeModifier : number,
            loop? : boolean, startTime?: number, fadeTime?: number) : void
    fadeOut(time : number) : void;
    
    stop() : void;
    pause() : void;
    resume(volumeModifier : number, newVolume? : number) : void;

    changeVolume(newVolume : number) : void;
}


export interface AudioPlayer {

    playSample(sample : AudioSample | undefined, volume? : number) : void;
    playMusic(sample : AudioSample | undefined, vol? : number) : void

    fadeInMusic(sample : AudioSample | undefined, volume? : number, fadeTime? : number) : void;
    fadeOutMusic(time : number) : void;

    pauseMusic() : void;
    resumeMusic(newVolume? : number) : boolean;
    stopMusic() : void;
    setMusicTrackVolume(vol : number) : void;

    setGlobalSoundVolume(vol : number) : void;
    setGlobalMusicVolume(vol : number) : void;

    getGlobalSoundVolume() : number;
    getGlobalMusicVolume() : number;

    decodeSample(sampleData : ArrayBuffer, callback : (s : AudioSample) => any) : void;

    isMusicPlaying() : boolean;
}
