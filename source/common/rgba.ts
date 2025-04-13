

export class RGBA {

	
	public r : number;
	public g : number;
	public b : number;
	public a : number;


	constructor(r : number = 1.0, g : number = 1.0, b : number = 1.0, a : number = 1.0) {

		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}


    public clone = () : RGBA => new RGBA(this.r, this.g, this.b, this.a);


	public toArray(includeAlpha : boolean = true) : number[] {

		if (includeAlpha) {

			return [this.r, this.g, this.b, this.a];
		}
		return [this.r, this.g, this.b];
	}


	// More memory friendly than creating a new object each time.
	public setValues(r : number, g : number, b : number, a : number = 1.0) : void {

		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	} 


	static invert(c : RGBA) : RGBA {

		const out : RGBA = new RGBA();

		out.r = 1.0 - c.r;
		out.g = 1.0 - c.g;
		out.b = 1.0 - c.b;

		return out;
	}


	static get white() : RGBA {
		
		return new RGBA(1, 1, 1, 1);
	}


	static get black() : RGBA {
		
		return new RGBA(0, 0, 0, 1);
	}
}
