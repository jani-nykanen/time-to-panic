

export function repeatArray<T> (array : T[], count : number) : T[] {

    const out : T[] = [];
    for (let i : number = 0; i < count; ++ i) {

        for (const o of array) {

            out.push(o);
        }
    }
    return out;
}