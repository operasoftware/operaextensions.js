/*
 * Copyright 2011-2012 Darko Pantić (pdarko@myopera.com)
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
	if (!Array.isArray) {
		/**
		 * Check if the argument is an object whose class internal
		 * property is <code>Array</code>.
		 *
		 * @param {Any} array
		 * Argument of any type.
		 *
		 * @returns {Boolean}
		 * <code>true</code> if <cite>array</cite> is an Array;
		 * <code>false</code> otherwise.
		 */
		Array.isArray = function (array) {
			return Object.prototype.toString.call(array) == "[object Array]";
		};
	}

	if (!Array.prototype.inArray) {
		/**
		 * Check if element is in array.
		 *
		 * @param {Any} element
		 * Element to search for.
		 *
		 * @returns {Boolean}
		 * <code>true</code> if element if found; <code>false</code> otherwise.
		 */
		Array.prototype.inArray = function (element) {
			return this.some(function (item) {
					return item === element;
				});
		};
	}
})(window, window.document);
