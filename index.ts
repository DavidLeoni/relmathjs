


/**
 * Deep copy an object (make copies of all its object properties, sub-properties, etc.)
 * An improved version of http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
 * that doesn't break if the constructor has required parameters
 * 
 * It also borrows some code from http://stackoverflow.com/a/11621004/560114
 * 
 * (dav: solution copied from here: http://stackoverflow.com/a/13333781)
 */  
function clone(src, /* INTERNAL */ _visited?) {
    if(src == null || typeof(src) !== 'object'){
        return src;
    }

    // Initialize the visited objects array if needed
    // This is used to detect cyclic references
    if (_visited == undefined){
        _visited = [];
    }
    // Otherwise, ensure src has not already been visited
    else {
        var i, len = _visited.length;
        for (i = 0; i < len; i++) {
            // If src was already visited, don't try to copy it, just return the reference
            if (src === _visited[i]) {
                return src;
            }
        }
    }

    // Add this object to the visited array
    _visited.push(src);

    //Honor native/custom clone methods
    if(typeof src.clone == 'function'){
        return src.clone(true);
    }

    //Special cases:
    //Array
    if (Object.prototype.toString.call(src) == '[object Array]') {
        //[].slice(0) would soft clone
        ret = src.slice();
        var i = ret.length;
        while (i--){
            ret[i] = clone(ret[i], _visited);
        }
        return ret;
    }
    //Date
    if (src instanceof Date){
        return new Date(src.getTime());
    }
    //RegExp
    if(src instanceof RegExp){
        return new RegExp(src);
    }
    //DOM Elements
    if(src.nodeType && typeof src.cloneNode == 'function'){
        return src.cloneNode(true);
    }

    //If we've reached here, we have a regular object, array, or function

    //make sure the returned object has the same prototype as the original
    var proto = (Object.getPrototypeOf ? Object.getPrototypeOf(src): src.__proto__);
    if (!proto) {
        proto = src.constructor.prototype; //this line would probably only be reached by very old browsers 
    }
    var ret = Object.create(proto);

    for(var key in src){
        //Note: this does NOT preserve ES5 property attributes like 'writable', 'enumerable', etc.
        //For an example of how this could be modified to do so, see the singleMixin() function
        ret[key] = clone(src[key], _visited);
    }
    return ret;
}




let SVG: any;

let checkNotNull = (x: any, msg?: string): any => {
    if (x || typeof x === "number" || typeof x === "string") {
        return x;
    } else {
        let newMsg = msg ? msg : "Found null/undefined value: ";
        throw new Error(newMsg + x);
    }
}

let checkArgument = (x: boolean, msg?: string): any => {
    checkNotNull(x);
    if (x) {
        return x;
    } else {
        let newMsg = msg ? msg : "Found false argument!";
        throw new Error(newMsg);
    }
}

/**
 * Checks plain javascript equality with ===
 */

let checkEquals = (x: any, y: any, msg?: string): any => {
    if (x === y) {
        return x;
    } else {
        let newMsg = msg ? msg : "x !== y ! x was :" + x + " and y was: " + y;
        throw new Error(newMsg);
    }
}

/**
 * Checks provided array is not empty
 */

let checkNotEmpty = (arr: Array<any>, msg?: string): any => {

    checkNotNull(arr);
    checkArgument(Array.isArray(arr), "PRovided param is not an Array!");
    if (arr.length > 0) {
        return arr;
    } else {
        let newMsg = msg ? msg : "Provided parameter is not an array! :" + arr;
        throw new Error(newMsg);
    }
}

/*
class Handler {
    msgs:string[];  
    constructor(msgs:string[]) {
        this.msgs = msgs;
    }
    greet() {
        this.msgs.forEach(x=>alert(x));
    }
}

function createHandler(handler: typeof ObjectConstructor, params: string[]) {
    var obj = new handler(params);
    return obj;
}

var h = createHandler(Handler, ['hi', 'bye']);
h.greet();
*/
/**
 * <P> the fields of the class. P should be an interface with all optional types. 
 */
 class Immutable<P> {

    protected check() {
        return this;
    }
    
    static getInstance() {
     return new this;
    }
	
    /**
     * Returns a shallow clone merging in the result the provided fields.
     */
    public with(fields: P): this {
        
        let ret = clone(this);
        for (let key of Object.keys(fields)) {
            ret[key] = fields[key];
        }
        return ret.check();
    }

    public static trial(){
        return new this;
    }
}

/**
 * Example of parameters
 */
interface MyClassFields {
    x?: string;
    y? : number;
}

class MyClass extends Immutable<MyClassFields> {

    x: string;
    y: number;

    f() {	        
        //return this.check();
        return this.with({ x: "a" });
    }
}


let DEFAULT_RADIUS: number = 30;




let toText = (obj: any) => {
    if (typeof obj === "string"
        || typeof obj === "number"
        || typeof obj === "date") {
        return obj.toString();
    } else {
        return JSON.stringify(obj);
    }
}


/**
 * Admits only 3 letter lowercase color strings like #3fc
 */
let checkColor = (colorString: string) => {
    checkNotNull(colorString);
    checkEquals(colorString.length, 4);
    checkEquals(colorString.charAt(0), '#');
    for (let i = 1; i < colorString.length; i++) {
        let c = colorString.charAt(i);
        if (isNaN(+c) && c === c.toUpperCase()) {
            throw new Error("We admit only lowercase characters in color strings! Found instead: '" + c + "' in " + colorString);
        }
    }
}

interface StyleParams {
    
    color? : string;
    backgroundColor? : string;
    borderColor? : string;
    fontSize? : string;          
}

class Style extends Immutable<StyleParams>{

    public static DEFAULT = new Style();

    color = "#000";
    backgroundColor = "#fff";
    borderColor = "#000";
    fontSize = 10;

    static of(): Style {
        return Style.DEFAULT;
    }
    
    f(){
        this.with({color:"a"});
    }
}

let DEBUG_STYLE = Style.DEFAULT.with({
    backgroundColor :"#ecc",
    color:"#f00",
    borderColor: "#f00",    
});
    


/**
 * <pre>
 * 
 *   0 1 2
 * 0 .
 * 1 .
 * 2   .
 * 3 . . 
 * 
 * </pre>
 */
class Relation {
    domain: Object[];
    codomain: Object[];
    mappings: boolean[][];

    constructor(domain: Object[], codomain: Object[], mappings: boolean[][]) {
        checkNotNull(domain);
        checkNotNull(codomain);
        checkNotNull(mappings);

        checkArgument(mappings.length === domain.length, "Mappings should have " + domain.length + " rows, "
            + " but has instead length " + mappings.length);

        mappings.forEach((arr, i) => {
            checkArgument(mappings[i].length === codomain.length, "Mappings row at " + i + " has length "
                + mappings[i].length + " but should have length " + codomain.length);
        });

        this.domain = domain;
        this.codomain = codomain;
        this.mappings = mappings;

    }

    draw(display: Display, rect: Rect, style?: Style) {
        display.drawRect(rect, DEBUG_STYLE);
        this.drawDomain(display, this.domain, rect, style);
    }
	
	/**
	 * <pre>
	 * -------
	 * |     |
	 * |- a -| 
	 * |     |
	 * |- b -|
	 * |     |
	 * -------
	 * </pre>
	 * 
	 * 
	 * Draws domain within given rect
	 */
    drawDomain(display: Display, domain: Object[], rect: Rect, style?: Style) {
        checkNotNull(domain);
        checkNotNull(rect);
        if (domain.length === 0) {
            return;
        }

        let dy = rect.height / (domain.length + 1);
        let x = rect.origin.x + (rect.width / 2);

        for (let d of domain) {
            for (let iy = 0; iy < domain.length; iy++) {
                let y = rect.origin.y + rect.height - (iy + 1) * dy;
                let center = new Point(x, y);
                display.drawCircle(center, DEFAULT_RADIUS, style);
                display.drawText(toText(d), center, style);
            }
        }
    }

}


/**
 *  Coords in pixels
 * 
 * <pre>
 *  -1, 1   0, 1	1, 1
 *  -1, 0   0, 0    1, 0
 *  -1,-1   0,-1	1,-1
 *
 * </pre>
 * 
 */
class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        checkNotNull(x);
        checkNotNull(y);
        this.x = x;
        this.y = y;
    }

}

/**
 *  Coords in pixels, see {@link Point}
 */
class Rect {
	/**
	 * Lower left corner (as it should be !!) 
	 */
    origin: Point;
    width: number;
	/**
	 * Height from bottom to top (as it should be!)
	 */
    height: number;

    constructor(origin: Point, width: number, height: number) {
        checkNotNull(origin);
        checkNotNull(width);
        checkNotNull(height);

        this.origin = origin;
        this.width = width;
        this.height = height;
    }
}



class Display {

    private draw;

    rect: Rect;

	/**
	* TODO: automatically handly newlines 
	*/
    drawText(text: string, center: Point, style = Style.of()) {
        checkNotNull(text);
        let approxTextWidth = text.length * style.fontSize * 0.1;
        let t = this.draw
            .text(text)
            .move(this.xToViewport(center.x) - (approxTextWidth / 2),
            this.yToViewport(center.y) - (style.fontSize / 2))
            .fill(style.color)
            .font({
                family: 'Source Sans Pro',
                size: style.fontSize,
                anchor: 'middle',
                leading: 1
            });
    }

    drawCoords() {
        let sectors = 6
        let dx = this.rect.width / sectors;
        let dy = this.rect.height / sectors;
        for (let xi = 0; xi < sectors; xi++) {
            for (let yi = 0; yi < sectors; yi++) {
                let x = xi * dx;
                let y = yi * dy;
                let t = this.draw
                    .text(x.toFixed(0) + ',' + y.toFixed(0))
                    .move(x, y)
                t.font({
                    family: 'Source Sans Pro'
                    , size: 10
                    , anchor: 'middle'
                    , leading: 1
                })

            }
        }
    }

    xToViewport(x: number) {
        return x + this.rect.width / 2;
    }

    yToViewport(y: number) {
        return (this.rect.height / 2) - y;
    }


    constructor(width: number, height: number) {
        // create svg drawing

        checkArgument(width > 0);
        checkArgument(height > 0);

        this.rect = new Rect(new Point(-width / 2, -height / 2), width, height);

        var mySVG = document.getElementById("drawing");
        mySVG.style.width = this.rect.width.toString() + "px";
        mySVG.style.height = this.rect.height.toString() + "px";


        this.draw = SVG('drawing');

		/* 
		this.draw.rect(this.width, this.height)
			.move(0, 0)
			.fill('#ddd')
		*/
		
        //this.drawRect(new Rect(new Point(0,0), 50, 200));
		
		
		
		/*
				this.draw
					.rect(150, 50)
					.move(100, 100)
					.fill('#f09')
		*/
		 
        // create image
        // var image = draw.image('images/shade.jpg')
        // image.size(650, 650).y(-150)

        // this.drawCoords();
		
		/*
        // create text
        var text = this.draw.text('some TEXT').move(300, 0)
        text.font({
			family: 'Source Sans Pro'
			, size: 100
			, anchor: 'middle'
			, leading: 1
        })
		*/

        // clip image with text
        //image.clipWith(text)
    }

    drawLine(a: Point, b: Point) {

    }

    drawCircle(centre: Point, radius: number, style = Style.of()) {
        checkNotNull(centre);
        checkNotNull(radius);
        this.draw.circle(radius)
            .move(this.xToViewport(centre.x - (radius / 2)), this.yToViewport(centre.y + (radius / 2)))
            .fill(style.backgroundColor)
    }

    drawRect(rect: Rect, style = Style.of()) {
        checkNotNull(rect);
        this.draw.rect(rect.width, rect.height)
            .move(this.xToViewport(rect.origin.x), this.yToViewport(rect.origin.y) - rect.height)
            .fill(style.backgroundColor)
    }


}

let rel = new Relation(["a", "b"], [1, 2], [[true, false], [false, false]]);

let display = new Display(300, 300);
console.log("r = ", rel);

let relStyle = Style.DEFAULT.with({backgroundColor : "#00f"});
        

//display.drawCircle(new Point(0,0), 30, Style.builder().backgroundColor("#f00").build());

let relRect = new Rect(new Point(0, 0), display.rect.width / 3, display.rect.height / 3);

rel.draw(display, relRect, relStyle);

