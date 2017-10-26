/*jslint esnext:true, browser: true,evil:true*/
/*globals Main*/
class Point extends Main {
	constructor(x,y,a) {
		super();
        this._x = x || 0;
		this._y = y || 0;
		this._a = a || 0;	// l'angle en radians
	}
	get x() {
		return this._x;
	}
	set x(val) {
		this._x = val;
	}
	get y() {
		return this._y;
	}
	set y(val) {
		this._y = val;
	}
	get a() {
		return this._a;
	}
	get r() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	set a(val) {
		this._a = val % Math.TAU;
		while (this._a < 0) {
			this._a += Math.TAU;
		}
		return this;
	}
	get aDeg() {
		return Math.radDeg(this._a);
	}
	set aDeg(val) {
		this._a = Math.degRad(val);
		return this;
	}
	get coords() {
		return this.x + "," + this.y;
	}
	set coords(val) {
		val = val.trim().split(/\s*,\s*/);
		this.x = parseFloat(val[0]) || 0;
		this.y = parseFloat(val[1]) || 0;
	}
	get transform() {
        return 'translate('+this.transform_translate+') rotate('+this.transform_rotate+')';
	}
	get transform_translate() {
        return ''+Math.round(this.x)+','+Math.round(this.y)+'';
	}
	get transform_rotate() {
        return ''+this.aDeg+'';
//        return ''+this.aDeg+','+this.x+','+this.y+'';
	}
	get matrix() {
        var elements = [];
		elements.push(Math.cos(this.a));
		elements.push(Math.sin(this.a));
		elements.push(-Math.sin(this.a));
		elements.push(Math.cos(this.a));
		elements.push(Math.round(this.x));
		elements.push(Math.round(this.y));
		return ''+elements.join(",")+'';
	}
	avancer(d) {
		var dx, dy;
		dx = this.a.cos(d).precision(4);
		dy = this.a.sin(d).precision(4);
		this.x += dx;
		this.y += dy;
		return this;
	}
	deplacement(d) {
		var dx, dy;
		dx = this.a.cos(d).precision(4);
		dy = this.a.sin(d).precision(4);
		return this.clone().placer(dx, dy);
	}
	reculer(d) {
		return this.reculer(-d);
	}
	orienter(a) {
		this.a = a;
		return this;
	}
	retourner() {
		this.a = this.a + Math.PI;
		return this;
	}
	tourner(a) {
		this.a += a;
		return this;
	}
	droite(a) {
		return this.tourner(a);
	}
	gauche(a) {
		return this.droite(-a);
	}
	placer(x, y, a) {
		if (arguments.length === 1) {
            return this.placer(arguments[0].x, arguments[0].y, arguments[0].a);
        }
        if (a !== undefined) {
			this.a = a;
		}
		this.x = x;
		this.y = y;
		return this;
	}
	clone() {
		return new Point(this.x,this.y,this.a);
	}
	diff(point) {
		var resultat;
		resultat = new Point(this.x,this.y,this.a);
		return this.clone().soustraire(point);
	}
	ajouter(point) {
		this.x += point.x;
		this.y += point.y;
		return this;
	}
	inverser() {
		this.x = -this.x;
		this.y = -this.y;
		this.a += Math.PI;
		return this;
	}
	soustraire(point) {
		this.x -= point.x;
		this.y -= point.y;
		return this;
	}
	mult(nb) {
		this.x *= nb;
		this.y *= nb;
		return this;
	}
	div(nb) {
		if (nb === 0) {
			return this;
		}
		this.x /= nb;
		this.y /= nb;
		return this;
	}
    distance(point) {
        return this.diff(point).r;
    }
    static init() {

    }
}
Point.init();
