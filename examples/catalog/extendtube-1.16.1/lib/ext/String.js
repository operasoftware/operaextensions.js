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

if (!String.natcmp) {
	/**
	 * Compare two strings naturally (eg: str-1.2 is lower than str-1.10).
	 *
	 * @param {String} first
	 * First string.
	 *
	 * @param {String} second
	 * First string.
	 *
	 * @returns {Number}
	 * 0 if equal, 1 if first string is greater, -1 if second is.
	 */
	String.natcmp = function (first, second) {
		first = ToString(first);
		second = ToString(second);

		if (first == second)
			return 0;

		first = first.split(/\b/);
		second = second.split(/\b/);

		for (var k = 0, l = Math.max(first.length, second.length); k < l; k++) {
			if (first[k] === undefined)
				return -1
			else if (second[k] === undefined)
				return 1

			// Test if strings are numbers (integers).
			if (/^\d+$/.test(first[k]) && /^\d+$/.test(second[k])) {
				first[k] = window.parseInt(first[k]);
				second[k] = window.parseInt(second[k]);
			}

			if (first[k] > second[k])
				return 1;
			else if (first[k] < second[k])
				return -1;
		}
	};
}

/**
 * Convert passed argument to string.
 *
 * @param {Any} arg
 * Argument of any type.
 *
 * @returns {String}
 * String representation of passed argument.
 */
function ToString(arg) {
	if (arg === null)
		arg = "null";
	else if (arg === undefined)
		arg = "undefined";
	else
		arg = arg.toString();

	return arg;
}
