

export const approachTargetValue = (speed : number, target : number, delta : number) : number => {

    if (speed < target) {

        return Math.min(target, speed + delta);
    }
    return Math.max(target, speed - delta);
}
