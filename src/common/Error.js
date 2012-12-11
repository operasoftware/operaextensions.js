
function OError(name, msg) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = name || "Error";
  this.message = msg || "";
};

OError.prototype.__proto__ = Error.prototype;
