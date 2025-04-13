

export class Vector {


    public x : number;
    public y : number;
    public z : number;
    public w : number;


	constructor(x : number = 0.0, y : number = 0.0, z : number = 0, w : number = 0) {
		
		this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
	}

	
	public get length() : number {

		return Math.hypot(this.x, this.y, this.z, this.w);
	}
	
	
	public normalize(forceUnit : boolean = false) : void {
		
		const SAFE_RANGE : number = 0.0001;
		
		const len : number = this.length;
		if (len < SAFE_RANGE) {
			
			this.x = forceUnit ? 1 : 0;
            this.y = 0;
			this.z = 0;
			this.w = 0;
			return;
		}
		
		this.x /= len;
		this.y /= len;
		this.z /= len;
		this.w /= len;
	}
	
	
	public clone = () : Vector => new Vector(this.x, this.y, this.z, this.w);


	public makeEqual(v : Vector) : void {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = v.w;
	}


	public scale(x : number, y : number = x, z : number = x) : void {

		this.x *= x;
		this.y *= y;
		this.z *= z;
	}


	public zero() : void {

        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
	}


	public equals(v : Vector, threshold : number = 0.0001) : boolean {

		return Math.abs(v.x - this.x) < threshold &&
			   Math.abs(v.y - this.y) < threshold &&
			   Math.abs(v.w - this.w) < threshold &&
			   Math.abs(v.z - this.z) < threshold;	
	} 


	public isZero(threshold : number = 0.0001) : boolean {

		return Math.abs(this.x) < threshold &&
			   Math.abs(this.y) < threshold && 
			   Math.abs(this.z) < threshold &&
			   Math.abs(this.w) < threshold;	
	}


	public toArray(components : 2 | 3 | 4 = 2) : number[] {

		switch (components) {

		case 2: return [this.x, this.y];
		case 3: return [this.x, this.y, this.z];
		case 4: return [this.x, this.y, this.z, this.w];

		default:
			break;
		}

		// Never reached if one does not pass something ugly to the "components"
		// (like "bananas" as 2 | 3 | 4)
		return [];
	} 


	static dot = (u : Vector, v : Vector) : number => u.x*v.x + u.y*v.y + u.z*v.z + u.w*v.w;


	static cross(u : Vector, v : Vector) : Vector {

		return new Vector(
			u.y*v.z - u.z*v.y,
			-(u.x*v.z - u.z*v.x),
			u.x*v.y - u.y*v.x);
	}
	

	static normalize(v : Vector, forceUnit = false) : Vector {
        
        const out : Vector = v.clone();

        out.normalize(forceUnit);

        return out;
    }


	static scalarMultiply = (v : Vector, s : number) : Vector => new Vector(v.x*s, v.y*s, v.z*s, v.w*s);
	

	static distance = (a : Vector, b : Vector) : number => Math.hypot(
        a.x - b.x, 
        a.y - b.y,
        a.z - b.z,
        a.w - b.w
    );


	static direction = (from : Vector, to : Vector) : Vector => Vector.normalize(
        new Vector(to.x - from.x, to.y - from.y, to.z - from.z, to.w - from.w), false);
	

	static add = (a : Vector, b : Vector) : Vector => new Vector(
        a.x + b.x, 
        a.y + b.y,
        a.z + b.z,
        a.w + b.w
    );


	static subtract = (a : Vector, b : Vector) : Vector => new Vector(
        a.x - b.x, 
        a.y - b.y,
        a.z - b.z,
        a.w - b.w
    );


	static truncate(v : Vector, radius : number, threshold : number = 0.0001) : Vector {

		const out : Vector = v.clone();

		if (out.length >= radius - threshold) {

			out.normalize();

			out.x *= radius;
			out.y *= radius;
		}
		return out;
	}


	static project = (u : Vector, v : Vector) : Vector => Vector.scalarMultiply(v, Vector.dot(u, v));


	static lerp = (a : Vector, b : Vector, t : number) : Vector => new Vector(
        (1 - t)*a.x + t*b.x, 
        (1 - t)*a.y + t*b.y,
        (1 - t)*a.z + t*b.z, 
        (1 - t)*a.w + t*b.w
    );


	static min = (v : Vector) : number => Math.min(v.x, v.y, v.z, v.w);
	static max = (v : Vector) : number => Math.max(v.x, v.y, v.z, v.w);

}
