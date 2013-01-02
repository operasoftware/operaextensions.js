/* 
 * Let the background process know that a page loaded.
 */
window.addEventListener("DOMContentLoaded", function()
						{
							var href = document.location.href;
							var dm = document.domain;
							var rs = "";
							if(document.cookie.indexOf("ck_httponly") > 0)
								rs = "ck_httponly cookie found in document.cookie (should not have)";
							switch  (dm)
							{
								case "people.opera.com":
								case "t.oslo.osa":
								case "testsuites.oslo.opera.com":
								case "testsuites.oslo.osa":
								case "www.testsuites.oslo.osa":
								case "www.testsuites.oslo.opera.com":
								case "t":
									opera.extension.postMessage("Loaded:" + document.domain + "\n" + rs);
									opera.postError("Loaded:" + document.domain);
									break;
								default:
									break;
							}
						}, false);
