/*
 * Copyright 2009-2012 Darko Pantić (pdarko@myopera.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (window, document) {
	/**
	 * Will throw an error if some of the arguments is not string
	 * or is empty string.
	 */
	function checkStringType() {
		Array.prototype.forEach.call(arguments, function (argument) {
			if (!argument || typeof argument != "string")
				throw new TypeError("Wrong argument type.");
		});
	}

	if (!Element.prototype.containingBlock) {
		/**
		 * Find containing block of an element.
		 *
		 * @returns {Element}
		 * <code>Element</code> that is containing block for <code>this</code> element.
		 */
		Element.prototype.__defineGetter__("containingBlock", function() {
			if (this == document.documentElement)
				return this;

			var position = window.getComputedStyle(this, null).position;

			/*
			 * If the element has “position: fixed”, the containing block
			 * is established by the viewport.
			 */
			if (position == "fixed")
				return document.documentElement;
			/*
			 * If the element has “position: absolute”, the containing block
			 * is established by the nearest ancestor with a “position” of
			 * “absolute”, “relative” or “fixed”.
			 */
			else if (position == "absolute") {
				var node = this,
					x = false;

				do {
					node = node.parentNode;

					if (node && node != document.documentElement)
						x = window.getComputedStyle(node, null).position == "static";
					else
						return document.documentElement;
				} while (node && x);

				return node;
			}
			/*
			 * If the element’s position is “relative” or “static”, the
			 * containing block is formed by the content edge of the nearest
			 * block-level, table-cell or inline-block ancestor box.
			 */
			else {
				var node = this,
					x = null,
					block = /^(block|list-item|run-in|table|table-cell|inline-block)$/;

				do {
					node = node.parentNode;

					if (node && node != document.documentElement)
						x = block.test(window.getComputedStyle(node, null).display);
					else
						return document.documentElement;
				} while (node && !x);

				return node;
			}
		});
	}

	if (!Element.prototype.offsetFromLeft) {
		/**
		 * Left offset from document root.
		 *
		 * @returns {Number}
		 * Left offset of current element compared to document root.
		 */
		Element.prototype.__defineGetter__("offsetFromLeft", function () {
			var left = 0,
				node = this;

			do
				left += node.offsetLeft;
			while (node = node.offsetParent);

			return left;
		});
	}

	if (!Element.prototype.offsetFromTop) {
		/**
		 * Top offset from document root.
		 *
		 * @returns {Number}
		 * Top offset of current element compared to document root.
		 */
		Element.prototype.__defineGetter__("offsetFromTop", function () {
			var top = 0,
				node = this;

			do
				top += node.offsetTop;
			while (node = node.offsetParent);

			return top;
		});
	}

	if (!Element.prototype.inView) {
		/**
		 * Is element visible on viewport.
		 *
		 * @returns {Boolean}
		 * <code>true</code> if element or part of it is visible;
		 * <code>false</code> otherwise.
		 */
		Element.prototype.__defineGetter__("inView", function () {
			if (document.documentElement.scrollTop > (this.offsetFromTop - window.innerHeight))
				return true;
			else
				return false;
		});
	}

	if (!Element.prototype.removeClass) {
		/**
		 * Remove a class from class attribute of element.
		 *
		 * @param {String} className
		 * Name of class to be removed from <code>Element</code>.
		 */
		Element.prototype.removeClass = function (className) {
			checkStringType(className);

			var classes = this.getAttribute("class");
			if (classes) {
				className.split(' ').forEach(function (item) {
					classes = classes.split(' ').reduce(function (previous, current) {
						if (current == item)
							return previous;
						else
							return previous + ' ' + current;
					}, '');
				});

				this.setAttribute("class", classes);
			}
		};
	}

	if (!Element.prototype.addClass) {
		/**
		 * Add a class to class attribute of element.
		 *
		 * @param {String} className
		 * Name of class to be added to <code>Element</code>.
		 */
		Element.prototype.addClass = function (className) {
			checkStringType(className);

			var classes = this.getAttribute("class");
			if (!classes)
				classes = '';

			var newClasses = '';
			className.split(' ').forEach(function (item) {
				if (!classes.split(' ').some(function (current) { return current == className; }))
					newClasses += ' ' + item;
			});

			this.setAttribute("class", classes + newClasses);
		};
	}
})(window, window.document);
