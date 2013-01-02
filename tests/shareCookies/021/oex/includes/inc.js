/* 
 * Let the background process know that a page loaded.
 */
window.addEventListener("DOMContentLoaded", function()
						{
							var href = document.location.href;
							var dm = document.domain;
							switch  (dm)
							{
								case "people.opera.com":
								case "t.oslo.osa":
								case "testsuites.oslo.opera.com":
								case "testsuites.oslo.osa":
								case "www.testsuites.oslo.osa":
								case "www.testsuites.oslo.opera.com":
								case "t":
									opera.extension.postMessage("Loaded:" + document.domain);
									opera.postError("Loaded:" + document.domain);
									break;
								default:
									break;
							}
							}, false);
