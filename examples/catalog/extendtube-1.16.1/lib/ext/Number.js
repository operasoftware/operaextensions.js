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
	if (!Number.prototype.toTimeString) {
		/**
		 * Treat number as number of seconds and convert it to time string.
		 *
		 * @param {Boolean} showmin
		 * Show minute even if it’s zero.
		 *
		 * @param {Boolean} showhour
		 * how hour even if it’s zero.
		 *
		 * @returns {String}
		 * Time formatted as string (h:mm:ss).
		 */
		Number.prototype.toTimeString = function (showmin, showhour) {
			var time = Math.floor(this % 60).toString(),
				minute = Math.floor((this / 60) % 60),
				hour = Math.floor(this / 3600);

			if (minute || showmin || hour || showhour) {
				if (time.length < 2)
					time = '0' + time;
				time = minute.toString() + ':' + time;
				if (hour || showhour) {
					if (minute < 10)
						time = hour.toString() + ":0" + time;
					else
						time = hour.toString() + ':' + time;
				}
			}

			return time;
		};
	}

	if(!Number.prototype.round) {
		/**
		 * Round number to given decimals
		 *
		 * @param {Number} position
		 * Number of digits to round number to.
		 *
		 * @param {Number} [base = 10]
		 * Base of number.
		 * @returns {Number}
		 * Number rounded to <cite>position</cite> decimal places.
		 */
		Number.prototype.round = function(position, base) {
			if (!base)
				base = 10;

			position = Math.pow(base, position);
			return Math.round(this * position) / position;
		};
	}

	if (!Number.prototype.toPaddedString) {
		/**
		 * Convert number to string of fixed length. Pad it wit defined character.
		 *
		 * @param {Number} length
		 * Targeted length.
		 *
		 * @param {String} [padchar = '0']
		 * Character to pad with.
		 *
		 * @returns {String}
		 * Number as string of <cite>length</cite> lenght, padded with <cite>padchar</cite>.
		 */
		Number.prototype.toPaddedString = function (length, padchar) {
			if (!padchar)
				padchar = '0';

			var number = this.toString();
			if (number.length < length) {
				var pad = length - number.length;
				while (pad-- > 0)
					number = padchar + number;
			}

			return number;
		};
	}
})(window, window.document);
