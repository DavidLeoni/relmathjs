


/**
 * Deep copy an object (make copies of all its object properties, sub-properties, etc.)
 * An improved version of http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
 * that doesn't break if the constructor has required parameters
 * 
 * It also borrows some code from http://stackoverflow.com/a/11621004/560114
 * 
 * (dav: solution copied from here: http://stackoverflow.com/a/13333781)
 */
function deepClone(src, /* INTERNAL */ _visited?) {
    if (src == null || typeof (src) !== 'object') {
        return src;
    }

    // Initialize the visited objects array if needed
    // This is used to detect cyclic references
    if (_visited == undefined) {
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
    if (typeof src.clone == 'function') {
        return src.clone(true);
    }

    //Special cases:
    //Array
    if (Object.prototype.toString.call(src) == '[object Array]') {
        //[].slice(0) would soft clone
        ret = src.slice();
        var i = ret.length;
        while (i--) {
            ret[i] = deepClone(ret[i], _visited);
        }
        return ret;
    }
    //Date
    if (src instanceof Date) {
        return new Date(src.getTime());
    }
    //RegExp
    if (src instanceof RegExp) {
        return new RegExp(src);
    }
    //DOM Elements
    if (src.nodeType && typeof src.cloneNode == 'function') {
        return src.cloneNode(true);
    }

    //If we've reached here, we have a regular object, array, or function

    //make sure the returned object has the same prototype as the original
    var proto = (Object.getPrototypeOf ? Object.getPrototypeOf(src) : src.__proto__);
    if (!proto) {
        proto = src.constructor.prototype; //this line would probably only be reached by very old browsers 
    }
    var ret = Object.create(proto);

    for (var key in src) {
        //Note: this does NOT preserve ES5 property attributes like 'writable', 'enumerable', etc.
        //For an example of how this could be modified to do so, see the singleMixin() function
        ret[key] = deepClone(src[key], _visited);
    }
    return ret;
}




let SVG: any;

let checkNotNull = (x: any, msg?: string): any => {
    if (x || typeof x === "number" || typeof x === "string" || typeof x === "boolean") {
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
 * Checks provided array or string is not empty
 */
let checkNotEmpty = (obj: Array<any> | string, msg?: string): any => {

    checkNotNull(obj);

    if (typeof obj === "string" || Array.isArray(obj)) {
        if (obj.length > 0) {
            return obj;
        } else {
            let newMsg = msg ? msg : "Provided parameter is not empty! :" + obj;
            throw new Error(newMsg);
        }
    } else {
        throw new Error("Provided param is not an Array nor a string! " + obj);
    }
}


/**
 * <P> the fields of the class. P should be an interface with all optional fields. 
 */
interface Immutable<P> {

    /**
     * @throws Error if check fails.
     */
    check(): this;
	
    /**
     * Returns a shallow clone merging in the result the provided fields.
     */
    "with"(fields: P): this;

}


/**
 * Returns a new shallow copy of obj merging inside it the provided fields.
 */
let wither = <P, C extends Immutable<{}>>(properties: P, obj: C): C => {
    checkNotNull(properties);
    if (Object.keys(properties).length === 0) {
        return obj;
    } else {
        let ret = deepClone(obj); // todo should be shallow ...
        for (let key of Object.keys(properties)) {
            ret[key] = properties[key];
        }
        return ret.check();
    }
}

/**
 * 
 */
function of<P, C extends Immutable<{}>>(empty: C, properties?: P): C {
    if (properties) {
        return <any>empty.with(properties);
    } else {
        return empty;
    }

}



/**
 * Example of parameters
 */
interface MyImmFields {
    x?: string;
    y?: number;

}

/**
 * Example of immutable class. 
 */
class MyImm implements Immutable<MyImmFields>{

    private static DEFAULT = new MyImm();    

    /**
     * Shows we can have a get property if we want to
     */
    get x() {
        return this._x;
    }

    /** Avoid calling this directly, use {@link of} method instead.
     * (Constructor can't be private in Typescript)
     */
    constructor(
        private _x = "a",
        public y = 3) {

        this.check();
    }

    check() {
        checkArgument(this.y > 2);
        return this;
    }

    static of(properties?: MyImmFields) {
        return of(MyImm.DEFAULT, properties);
    }

    /** 
     * Note we currently need to manually add the 'this' as strangely 
     * enough Typescript doesn't infer the type. 
    */
    with(properties?: MyImmFields) : this {
        return wither(properties, this);
    }

    trial() {	        
        //return this.check();
        return this.with({ x: "a" });
    };

}


console.log("My immutable class = ", MyImm.of({ y: 3 }).with({ x: "3" }));

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

    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    fontSize?: string;
}

class Style implements Immutable<StyleParams>{

    public static DEFAULT = new Style();

    constructor(public color = "#000",
        public backgroundColor = "#fff",
        public borderColor = "#000",
        public fontSize = 20) {
        this.check();
    }

    check() {
        checkColor(this.color);
        checkColor(this.backgroundColor);
        checkColor(this.borderColor);
        checkArgument(this.fontSize && this.fontSize > 0);
        return this;
    }

    static of(properties?: StyleParams): Style {
        return of(Style.DEFAULT, properties);
    }

    with(properties?: StyleParams) : this {
        return wither(properties, this);
    }



}

let DEBUG_STYLE = Style.DEFAULT.with({
    backgroundColor: "#ecc",
    color: "#f00",
    borderColor: "#f00",
});


interface ShapeFields {
    id?: string;
    centre?: Point;
}




interface PointFields {
    x?: number;
    y?: number;
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
class Point implements Immutable<PointFields> {
    private static DEFAULT = new Point();

    constructor(public x = 0.0,
        public y = 0.0) {
        this.check();
    }

    check() {
        checkNotNull(this.x);
        checkNotNull(this.y);
        return this;
    }

    static of(properties?: PointFields) {
        return of(Point.DEFAULT, properties);
    }

    with(properties?: PointFields) : this {
        return wither(properties, this);
    }

}

/**
 * The bridge between logical view and physical view determined by the id
 */
class Shape implements Immutable<ShapeFields> {

    private static DEFAULT = new Shape();

    constructor(
        public id = "relmath-default-id",
        public centre = Point.of()) {
        this.check();
    }

    check() {
        checkNotEmpty(this.id);
        checkNotNull(this.centre);
        return this;
    }

    static of(properties?: ShapeFields) {
        return of(Shape.DEFAULT, properties);
    }

    with(properties?: ShapeFields) : this {
        return wither(properties, this);
    }
}



interface RelationFields {
    domain?: Object[],
    codomain?: Object[],
    mappings?: boolean[][]
}




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
class Relation implements Immutable<RelationFields>{

    private static DEFAULT = new Relation();

    constructor(public domain: Object[] = [],
        public codomain: Object[] = [],
        public mappings: boolean[][] = []) {
        this.check();
    }

    check() {
        checkNotNull(this.domain);
        checkNotNull(this.codomain);
        checkNotNull(this.mappings);

        checkArgument(this.mappings.length === this.domain.length, "Relation mappings should have "
            + this.domain.length + " rows, "
            + " but has instead length " + this.mappings.length);

        this.mappings.forEach((arr, i) => {
            checkArgument(this.mappings[i].length === this.codomain.length, "Relation mapping row at " + i + " has length "
                + this.mappings[i].length + " but should have length " + this.codomain.length);
        });

        return this;
    }

    static of(properties?: RelationFields) {
        return of(Relation.DEFAULT, properties);
    }

    with(properties?: RelationFields) : this {
        return wither(properties, this);
    }


    draw(display: Display, rect: Rect, style?: Style) {
        display.drawRect(rect, DEBUG_STYLE);

        let rectDomain = rect.with({ width: rect.width / 2 });
        console.log("this.domain = ", this.domain);
        let styleDomain = style.with({
            backgroundColor: "#fc9",
            color: "#000",
            borderColor: "#000"
        });
        let domainShapes = this.drawDomain(display, this.domain, rectDomain, styleDomain);

        let styleCodomain = styleDomain.with({
            backgroundColor: "#9cf"
        });

        let rectCodomain = rect.with({
            width: rect.width / 2,
            origin: rect.origin.with({
                x: rect.origin.x + (rect.width / 2)
            })
        });
        console.log("this.codomain = ", this.codomain);
        let codomainShapes = this.drawDomain(display, this.codomain, rectCodomain, styleCodomain);

        this.drawMappings(display, domainShapes, codomainShapes, style);
    }


    private drawMappings(display: Display,
        domainShapes: Shape[],
        codomainShapes: Shape[],
        style?: Style) {

        for (let d = 0; d < this.domain.length; d++) {
            for (let cd = 0; cd < this.codomain.length; cd++) {
                if (this.mappings[d][cd]) {
                    display.connect(domainShapes[d], codomainShapes[cd]);
                    // todo return;
                }
            }
        }

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
	 * Draws domain within given rect. Returns the ids of the created circles.
	 */
    drawDomain(display: Display, domain: Object[], rect: Rect, style?: Style): Shape[] {
        checkNotNull(domain);
        checkNotNull(rect);

        if (domain.length === 0) {
            return;
        }

        let ret: Shape[] = [];

        let centres = Relation.getCircleCentres(domain.length, rect);
        
        let parentShape = display.drawShape(Shape.of());
        
        for (let domi = 0; domi < domain.length; domi++) {
            ret.push(display.drawCircle(centres[domi],  DEFAULT_RADIUS, parentShape, style));
            display.drawText(toText(domain[domi]), centres[domi], style);
        }
        return ret;

    }

    /** 
     * Returns the centres of the circles to be displayed in a given domain/codomain region 
     * @param n The dimension of the domain/codomain
     * @param rect the region where the domain/codomain will be represented
     * 
     */
    private static getCircleCentres(n: number, rect: Rect): Point[] {
        let ret = [];
        let dy = rect.height / (n + 1);
        let x = rect.origin.x + (rect.width / 2);

        for (let domi = 0; domi < n; domi++) {
            let y = rect.origin.y + rect.height - (domi + 1) * dy;
            let center = new Point(x, y);
            ret.push(center);
        }
        return ret;
    }
}


interface RectFields {
	/**
	 * Lower left corner (as it should be !!) 
	 */
    origin?: Point;
    width?: number;
	/**
	 * Height from bottom to top (as it should be!)
	 */
    height?: number;

}

/**
 *  Coords in pixels, see {@link Point}
 */
class Rect implements Immutable<RectFields> {

    private static DEFAULT = new Rect();

    constructor(public origin = Point.of(),
        public width = 0,
        public height = 0) {
        this.check();
    }

    check() {
        checkNotNull(this.origin);
        checkNotNull(this.width);
        checkNotNull(this.height);
        return this;
    }

    static of(properties?: RectFields) {
        return of(Rect.DEFAULT, properties);
    }

    with(properties?: RectFields) : this {
        return wither(properties, this);
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

    drawShape(shape : Shape) : Shape {
        let g = this.draw.group();        
        return Shape.of({id:g.attr('id')})
    }

    /** 
     * Draws a line between two elements
    */
    connect(shape1: Shape, shape2: Shape) {
        checkNotNull(shape1);
        checkNotNull(shape2);

        var el1 = SVG.get(shape1.id);
        var el2 = SVG.get(shape2.id);

        console.log("el1 = ", el1);
        console.log("el2 = ", el2);

        var links = this.draw.group();
        var markers = this.draw.group();        
    
        el1.connectable({
            container: links,
            markers: markers,
            padEllipse : true
        }, el2).setLineColor("#5D4037");

    }

    drawLine(a: Point, b: Point, style = Style.of()) {

        this.draw.line(this.xToViewport(a.x), this.yToViewport(a.y),
            this.xToViewport(b.x), this.yToViewport(b.y))
            .stroke(style.color);
    }


    /** 
     * @param parentShape MUST BE A GROUP!
    */
    drawCircle(centre: Point, radius: number, parentShape : Shape, style = Style.of()): Shape {
        checkNotNull(centre);
        checkNotNull(radius);
        checkNotNull(parentShape);
        
        let nodes = SVG.get(parentShape.id);
        let g = nodes.group()
            .move(this.xToViewport(centre.x - (radius / 2)), this.yToViewport(centre.y + (radius / 2)));
        g.circle(radius)
            .fill(style.backgroundColor)
            .stroke(style.borderColor);
        console.log("group.attr('id')=", nodes.attr("id"));
        
        return Shape.of({ id: g.attr("id"), centre: centre });
    }

    drawRect(rect: Rect, style = Style.of()) {
        checkNotNull(rect);
        this.draw.rect(rect.width, rect.height)
            .move(this.xToViewport(rect.origin.x), this.yToViewport(rect.origin.y) - rect.height)
            .fill(style.backgroundColor)
    }


}

let beliefs = ['☮', '☯', '☭']

let stars = ['★', '✩'];

let hands = ['☜', '☝', '☞', '☟'];

let dangers = ['☢', '☣', '⚡', '☠'];

let smilies = ['☹', '☺'];

let weather3 = ['☼', '☁', '☂']
let weather4 = ['☼', '☁', '☂', '❄']

let rel = Relation.of({
    domain: weather3,
    codomain: smilies,
    mappings: [[true, false],
        [false, false],
        [false, true]]
});

window.addEventListener("load", function() {
    let display = new Display(300, 300);
    console.log("r = ", rel);

    let relStyle = Style.DEFAULT.with({ backgroundColor: "#00f" });
            

    //display.drawCircle(new Point(0,0), 30, Style.builder().backgroundColor("#f00").build());

    let relRect = new Rect(new Point(0, 0), display.rect.width / 3, display.rect.height / 3);

    rel.draw(display, relRect, relStyle);

});
