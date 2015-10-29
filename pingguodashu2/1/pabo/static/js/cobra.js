(function (window) {

	function Animation(duration, render) {
		this.duration = duration;
		this.render = render;
	}
	Animation.prototype.play = function () {
		var me = this;
		var fps = 1000 / 60;
		var start = new Date().getTime();
		me.ticker = new Ticker(function () {
			var now = new Date().getTime();
			if (now - start <= duration) {
				var step = (now - start) / duration;
				render(Bezier.cubicBezier(0.99, 0, 0.66, 1, step, duration));
			} else {
				render(1);
			}
		}, fps);
	};
	Animation.prototype.pause = function () {
		me.ticker.sleep();
	};
	Animation.prototype.resume = function () {
		me.ticker.wake();
	};
	Animation.prototype.stop = function () {
		me.ticker.kill();
	};

	function Ticker(fn, fps) {
		this.fps = fps;
		this.fn = fn;
		this.state = 0;
		this._run();
	}
	Ticker.prototype._run = function () {
		var me = this;
		var sd = new Date().getTime();

		function loop() {
			if (!me.state) {
				var ed = new Date().getTime();
				if (ed - sd >= fps) {
					me.fn();
				}
				requestAnimationFrame(loop);
			}
		}
		requestAnimationFrame(loop);
	};
	Ticker.prototype.sleep = function () {
		this.state = 1;
	};
	Ticker.prototype.wake = function () {
		this.state = 0;
		this._run();
	};
	Ticker.prototype.kill = function () {
		this.state = 1;
		this.fps = 0;
		this.fn = null;
	};


	function Timeline() {
		var queue = [];
	}
	Timeline.prototype.add = function (animation) {
		queue.push(animation);
	};
	Timeline.prototype.remove = function (animation) {
		queue.forEach(function (item, i) {
			if (item === animation) {
				queue.splice(i, 1);
			}
		});
	};
	Timeline.prototype.play = function () {
		var me = this;
		var fps = 1000 / 60;
		var start = new Date().getTime();
		if (me.ticker) {
			me.ticker.kill();
		}
		me.ticker = new Ticker(function () {
			var now = new Date().getTime();
			queue.forEach(function (item, i) {
				var duration = item.duration,
					render = item.render;
				if (now - start <= duration) {
					var step = (now - start) / duration;
					render(Bezier.cubicBezier(0.99, 0, 0.66, 1, step, duration));
				} else {
					render(1);
				}
			});
		}, fps);
	};
	Timeline.prototype.pause = function () {
		me.ticker.sleep();
	};
	Timeline.prototype.resume = function () {
		me.ticker.wake();
	};
	Timeline.prototype.stop = function () {
		me.ticker.kill();
	};

	var Bezier = (function () {
		'use strict';
		var DEFAULT_DURATION = 400; //ms
		var solveEpsilon = function (duration) {
			return 1.0 / (200.0 * duration);
		};
		var unitBezier = function (p1x, p1y, p2x, p2y) {
			var cx = 3.0 * p1x;
			var bx = 3.0 * (p2x - p1x) - cx;
			var ax = 1.0 - cx - bx;
			var cy = 3.0 * p1y;
			var by = 3.0 * (p2y - p1y) - cy;
			var ay = 1.0 - cy - by;
			var sampleCurveX = function (t) {
				// `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
				return ((ax * t + bx) * t + cx) * t;
			};
			var sampleCurveY = function (t) {
				return ((ay * t + by) * t + cy) * t;
			};
			var sampleCurveDerivativeX = function (t) {
				return (3.0 * ax * t + 2.0 * bx) * t + cx;
			};
			var solveCurveX = function (x, epsilon) {
				var t0;
				var t1;
				var t2;
				var x2;
				var d2;
				var i;
				for (t2 = x, i = 0; i < 8; i++) {
					x2 = sampleCurveX(t2) - x;
					if (Math.abs(x2) < epsilon) {
						return t2;
					}
					d2 = sampleCurveDerivativeX(t2);
					if (Math.abs(d2) < 1e-6) {
						break;
					}
					t2 = t2 - x2 / d2;
				}

				// Fall back to the bisection method for reliability.
				t0 = 0.0;
				t1 = 1.0;
				t2 = x;

				if (t2 < t0) {
					return t0;
				}
				if (t2 > t1) {
					return t1;
				}

				while (t0 < t1) {
					x2 = sampleCurveX(t2);
					if (Math.abs(x2 - x) < epsilon) {
						return t2;
					}
					if (x > x2) {
						t0 = t2;
					} else {
						t1 = t2;
					}
					t2 = (t1 - t0) * 0.5 + t0;
				}

				// Failure.
				return t2;
			};

			var solve = function (x, epsilon) {
				return sampleCurveY(solveCurveX(x, epsilon));
			};
			return function (x, duration) {
				return solve(x, solveEpsilon(+duration || DEFAULT_DURATION));
			};
		};
		return {
			linear: unitBezier(0.0, 0.0, 1.0, 1.0),
			ease: unitBezier(0.25, 0.1, 0.25, 1.0),
			easeIn: unitBezier(0.42, 0, 1.0, 1.0),
			easeOut: unitBezier(0, 0, 0.58, 1.0),
			easeInOut: unitBezier(0.42, 0, 0.58, 1.0),
			cubicBezier: function (p1x, p1y, p2x, p2y, x, duration) {
				return unitBezier(p1x, p1y, p2x, p2y)(x, duration);
			}
		};
	})();

	window.Cobra = {
		Animation: Animation,
		Timeline: Timeline
	};

})(window);