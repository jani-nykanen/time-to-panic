

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

    setSoundVolume(vol : number) : void;
    setMusicVolume(vol : number) : void;

    getSoundVolume() : number;
    getMusicVolume() : number;

    decodeSample(sampleData : ArrayBuffer, callback : (s : AudioSample) => any) : void;

    isMusicPlaying() : boolean;
}
