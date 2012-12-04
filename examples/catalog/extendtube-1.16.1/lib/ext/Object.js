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
	/**
	 * Will throw an error if some of the arguments is not object.
	 */
	function checkObjectType() {
		Array.prototype.forEach.call(arguments, function (argument) {
			if (!Object.isObject(argument))
				throw new TypeError("Wrong argument type. Expected Object but got " + Object.internalClass(argument) + '.');
		});
	}

	/**
	 * Test if every arguments is object.
	 *
	 * @returns {Boolean}
	 * <code>false</code> if atleast one of the artguments is not object.
	 * <code>true</code> if evary argument is object.
	 */
	function isObject() {
		return Array.prototype.every.call(arguments, function (argument) {
			return Object.isObject(argument);
		});
	}

	if (!Object.internalClass) {
		/**
		 * Get internal class property for given argument.
		 *
		 * @param {Any} argument
		 * Argument of any type.
		 *
		 * @returns {String}
		 * Internal class property <cite>argument</cite>.
		 */
		Object.internalClass = function (argument) {
			return Object.prototype.toString.call(argument).replace(/^\[object\s|\]$/g, '');
		};
	}

	if (!Object.isObject) {
		/**
		 * Check if the argument is an object whose class internal
		 * property is <code>Object</code>.
		 *
		 * @param {Object} object
		 * Object to be tested.
		 *
		 * @returns {Boolean}
		 * <code>true</code> of object is Object, <code>false</code> otherwise.
		 */
		Object.isObject = function (object) {
			return object && typeof object == "object" && !Array.isArray(object);
		};
	}

	if (!Object.ls) {
		/**
		 * List all properties of an acyclic object.
		 *
		 * @param {Object} object
		 * Object to be listed.
		 *
		 * @returns {String}
		 * Stringified object.
		 *
		 * @throws {TypeError}
		 * If argument is cyclic object.
		 */
		Object.ls = function (object) {
			checkObjectType(object);

			return window.JSON.stringify(object, null, 2);
		};
	}

	if (!Object.copy) {
		/**
		 * This method will make a copy of an object. That means if object
		 * contain referencesto other objects or arrays they will be resolved
		 * and those elements will also be copied.
		 *
		 * @param {Object} object
		 * Object to make copy of.
		 *
		 * @returns {Object}
		 * Copy of an object.
		 *
		 * @throws {TypeError}
		 * If argument is not object.
		 */
		Object.copy = function(object) {
			checkObjectType(object);

			var copy = {};

			for (var key in object) {
				if (Array.isArray(object[key]))
					copy[key] = object[key].slice(0);
				else if (Object.isObject(object[key]))
					copy[key] = Object.copy(object[key]);
				else
					copy[key] = object[key];
			}

			return copy;
		};
	}

	if (!Object.isEqual) {
		/**
		 * Find if objects have identical property names and their values.
		 *
		 * @param {Object} A
		 * First object.
		 *
		 * @param {Object} B
		 * Second object.
		 *
		 * @returns {Boolean}
		 * <code>true</code> if objects are identical, <code>false</code> otherwise.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is not object or is cyclic object.
		 */
		Object.isEqual = function (A, B) {
			return window.JSON.stringify(Object.complement(A, B)) == "{}";
		};
	}

	if (!Object.keyComplement) {
		/**
		 * Find difference of objects property names.
		 *
		 * @param {Object} A
		 * First object.
		 *
		 * @param {Object} B
		 * Second object.
		 *
		 * @returns {Array}
		 * Array containing difference of objects property names.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is not object.
		 */
		Object.keyComplement = function (A, B) {
			checkObjectType(A, B);

			var difference = [];

			for (var key in A)
				if (!(key in B))
					difference.push(key);

			return difference;
		};
	}

	if (!Object.keySymmetricComplement) {
		/**
		 * Find symmetric difference of objects property names.
		 *
		 * @param {Object} A
		 * First object.
		 *
		 * @param {Object} B
		 * Second object.
		 *
		 * @returns {Array}
		 * Array containing symmetric difference of objects property names.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is not object.
		 */
		Object.keySymmetricComplement = function (A, B) {
			return Object.keyComplement(A, B).concat(Object.keyComplement(B, A));
		};
	}

	if (!Object.keyIntersection) {
		/**
		 * Find intersection of objects property names.
		 *
		 * @param {Object} A
		 * First object.
		 *
		 * @param {Object}
		 * B Second object.
		 *
		 * @returns {Array}
		 * Array containing intersection of objects property names.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is not object.
		 */
		Object.keyIntersection = function (A, B) {
			checkObjectType(A, B);

			var intersection = [];

			for (var key in A)
				if (key in B)
					intersection.push(key);

			return intersection;
		};
	}

	if (!Object.keyUnion) {
		/**
		 * Find union of objects property names.
		 *
		 * @param {Object} A
		 * First object.
		 *
		 * @param {Object} B
		 * Second object.
		 *
		 * @returns {Array}
		 * Array containing union of objects property names.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is not object.
		 */
		Object.keyUnion = function (A, B) {
			return Object.keyComplement(A, {}).concat(Object.keyComplement(B, A));
		};
	}

	if (!Object.complement) {
		/**
		 * Find difference of given objects.
		 *
		 * @param {Object} A
		 * First object.
		 *
		 * @param {Object} B
		 * Second object.
		 *
		 * @returns {Object}
		 * Object containing difference of objects properties.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is not object or is cyclic object.
		 */
		Object.complement = function (A, B) {
			checkObjectType(B);

			var difference = Object.copy(A),
				stringify = window.JSON.stringify;

			Object.keyIntersection(A, B).forEach(function (key) {
				if (stringify(A[key]) == stringify(B[key]))
					delete difference[key];
			});

			return difference;
		};
	}

	if (!Object.symmetricComplement) {
		/**
		 * Find symmetric difference of given objects.
		 *
		 * @param {Object} A
		 * First object.
		 *
		 * @param {Object} B
		 * Second object.
		 *
		 * @param {Boolean} [fromB = false]
		 * Copy value from object B if property name is equal but value
		 * is not; otherwise copy from object A.
		 *
		 * @returns {Object}
		 * Object containing symmetric difference of objects properties.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is not object.
		 */
		Object.symmetricComplement = function (A, B, fromB) {
			return Object.union(Object.complement(A, B), Object.complement(B, A), fromB);
		};
	}

	if (!Object.intersection) {
		/**
		 * Find intersection of given objects.
		 *
		 * @param {Object} A
		 * First object.
		 *
		 * @param {Object} B
		 * Second object.
		 *
		 * @returns {Object}
		 * Object containing intersection of objects properties.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is not object or is cyclic object.
		 */
		Object.intersection = function (A, B) {
			checkObjectType(B);

			var intersection = Object.copy(A),
				stringify = window.JSON.stringify;

			for (var key in A)
				if (stringify(A[key]) != stringify(B[key]))
					delete intersection[key];

			return intersection;
		};
	}

	if (!Object.union) {
		/**
		 * Find union of given objects. If some properties are also objects
		 * it will make union of them too.
		 *
		 * @param {Object} A
		 * First object.
		 *
		 * @param {Object} B
		 * Second object.
		 *
		 * @param {Boolean} [fromB = false]
		 * Copy value from object B if property name is equal;
		 * otherwise copy from object A.
		 *
		 * @returns {Object}
		 * Object containing union of objects properties.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is not object.
		 */
		Object.union = function (A, B, fromB) {
			var union = Object.copy(A),
				copyB = Object.copy(B);

			for (var key in B) {
				if (isObject(A[key], B[key]))
					union[key] = Object.union(A[key], B[key], fromB);
				else if (fromB || !(key in A))
					union[key] = copyB[key];
			}

			return union;
		};
	}
})(window, window.document);
