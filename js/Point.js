/*jslint esnext:true, browser: true,evil:true*/
/*globals Main*/
/**
 * Représente un point cartésien
 * @todo Voir si on peut/doit utiliser le sousmodule Geometrie
 */
class Point extends Main {
	/**
	 * Constructeur
	 * @param {number} x Position initiale du x
	 * @param {number} y Position initiale du y
	 * @param {number} a Angle en radians
	 * @todo Vérifier l'utilité de a
	 */
	constructor(x,y,a) {
		super();
        this._x = x || 0;
		this._y = y || 0;
		this._a = a || 0;	// l'angle en radians
	}
	/**
	 * L'abscisse
	 * @type {number}
	 */
	get x() {
		return this._x;
	}
	set x(val) {
		this._x = val;
	}
	/**
	 * L'ordonnée
	 * @type {number}
	 */
	get y() {
		return this._y;
	}
	set y(val) {
		this._y = val;
	}
	/**
	 * L'angle
	 * @type {number}
	 */
	get a() {
		return this._a;
	}
	set a(val) {
		this._a = val % Math.TAU;
		while (this._a < 0) {
			this._a += Math.TAU;
		}
		return this;
	}

	/**
	 * L'angle en degres
	 * @type {number}
	 */
	get aDeg() {
		return Math.radDeg(this._a);
	}
	set aDeg(val) {
		this._a = Math.degRad(val);
		return this;
	}
	/**
	 * Le rayon
	 * @type {number}
	 */
	get r() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	/**
	 * Les coordonnées au format "x,y"
	 * @type {string}
	 */
	get coords() {
		return this.x + "," + this.y;
	}
	set coords(val) {
		val = val.trim().split(/\s*,\s*/);
		this.x = parseFloat(val[0]) || 0;
		this.y = parseFloat(val[1]) || 0;
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
