(function () {
	function SailfishSlider(selector) {
		if (!selector) {
			console.error('selector can not be null');
		}
		this.dom = document.querySelector(selector);
		var cn = this.dom.className;
		if (cn) {
			this.dom.className += ' sailfishSlider';
		} else {
			this.dom.className = 'sailfishSlider';
		}
		this.w = this.dom.offsetWidth;
		this.currentIndex = 0;
		this.bindEvent();
		this.render(0);
	}

	SailfishSlider.prototype.bindEvent = function () {
		var me = this;
		me.dom.removeEventListener('touchstart', touchStart);
		me.dom.addEventListener('touchstart', touchStart);

		me.dom.removeEventListener('mousedown', touchStart);
		me.dom.addEventListener('mousedown', touchStart);

		me.dom.removeEventListener('touchmove', touchMove);
		me.dom.addEventListener('touchmove', touchMove);

		me.dom.removeEventListener('mousemove', touchMove);
		me.dom.addEventListener('mousemove', touchMove);

		document.removeEventListener('touchend', touchend);
		document.addEventListener('touchend', touchEnd);

		document.removeEventListener('mouseup', touchEnd);
		document.addEventListener('mouseup', touchEnd);

		function touchStart(e) {
			e.preventDefault();
			if (me.isBusy) return;
			var tt = e.targetTouches ? e.targetTouches[0] : e;
			me.startX = tt.pageX;
			me.canDrag = true;
		}

		function touchMove(e) {
			if (me.canDrag) {
				var tt = e.targetTouches ? e.targetTouches[0] : e;
				var dis = tt.pageX - me.startX;
				console.log('dis:' + dis);
				me.render(dis);
			}
		}

		function touchEnd(e) {
			if (me.canDrag) {
				me.canDrag = false;
				var tt = e.targetTouches ? e.targetTouches[0] : e;
				var offX = tt.pageX - me.startX;

				if (Math.abs(offX) > me.w / 4) {
					me.isBusy = true;
					if (offX > 0) {
						//swipe right
						if (me.currentIndex > 0) {
							me.currentIndex -= 1;
							// me.render(me.w - offX, true);
							me.render(0, true);
						} else {
							me.render(0, true);
						}
					} else {
						//siwpe left
						if (me.currentIndex < me.total - 1) {
							me.currentIndex += 1;
							// me.render(-me.w - offX, true)
							me.render(0, true);
						} else {
							me.render(0, true);
						}
					}
				} else {
					me.render(0, true);
				}
			}
		}
	};

	SailfishSlider.prototype.next = function () {
		this.currentIndex = 0;
		this.render(0);
	};

	SailfishSlider.prototype.render = function (offset, animate) {
		var me = this;

		var items = document.querySelectorAll('.slide', me.dom);
		items = Array.prototype.slice.call(items);
		me.total = items.length;
		if (!me.initLocator) {
			var locator = document.createElement('div');
			locator.className = 'locator';
			for (var i = 0; i < me.total; i++) {
				var span = document.createElement('span');
				span.className = 'locator-item';
				locator.appendChild(span);
			}
			me.dom.appendChild(locator);
			me.locator = locator;
			me.initLocator = true;
		}

		items.forEach(function (item, i) {
			var iw = me.w * (i - me.currentIndex) + offset;
			var css = [];
			if (animate) {
				css.push('-webkit-transition: all 0.5s cubic-bezier(0.99, 0, 0.66, 1);');
				css.push('-webkit-transform: translate3d(' + iw + 'px, 0, 0)');
			} else {
				css.push('-webkit-transition: all 0s linear;');
				css.push('-webkit-transform: translate3d(' + iw + 'px, 0, 0)');
			}
			item.setAttribute('style', css.join(';'));

			setTimeout(function () {
				me.isBusy = false;
			}, 550);
		});

		var locators = document.querySelectorAll('.locator-item', me.locator);
		locators = Array.prototype.slice.call(locators);
		locators.forEach(function (item, i) {
			if (i == me.currentIndex) {
				item.className = 'locator-item active';
			} else {
				item.className = 'locator-item';
			}
		});
	};

	window.SailfishSlider = SailfishSlider;
})();