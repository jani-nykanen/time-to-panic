import { Walker } from "./walker.js";
import { Mushroom } from "./mushroom.js";


export const getEnemyByIndex = (index : number) : Function => [

    Walker,
    Mushroom

][index] ?? Walker;
