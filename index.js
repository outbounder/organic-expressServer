var util = require("util");
var express = require('express');
var _ = require("underscore");
var fs = require("fs");

var Chemical = require("organic").Chemical;
var Organel = require("organic").Organel;

module.exports = function ExpressHttpServer(plasma, config){
  Organel.call(this, plasma);

  var app = this.app = express();

  this.config = config;
  var self = this;

  this.mountXware(this.config.middleware);
  this.app.use(this.app.router);
  this.mountXware(this.config.afterware);

  this.on("kill", this.close);

  config.port = config.port || 1337;

  this.server = app.listen(config.port, function(){
    if(config.log)
      console.log('HttpServer running at http://127.0.0.1:'+config.port+'/');
    self.emit(new Chemical(config.emitReady || "ExpressServer", self.app));
    if(config.emitServer)
      self.emit(new Chemical(config.emitServer, self.server))
  });
}

util.inherits(module.exports, Organel);

module.exports.prototype.mountXware = function(definitions){
  if(!definitions) return;

  var self = this;
  _.each(definitions, function(definition){

    var middlewareSource = definition.source || definition;
    var middlewareConfig = definition.source?definition:{};
    if(middlewareSource.indexOf("/") !== 0 || middlewareSource.indexOf(":\\") != 1)
      middlewareSource = process.cwd()+"/"+middlewareSource;

    if(self.config.log)
      console.log("middleware: ",middlewareSource, JSON.stringify(middlewareConfig));
    try {
      var middlewareFunc = require(middlewareSource)(middlewareConfig, self);
      if(middlewareFunc)
        self.app.use(middlewareFunc);
    } catch(err){
      console.log(err)
    }
  });
}

module.exports.prototype.close = function(chemical){
  if(this.closed) return false;
  this.server.close();
  this.closed = true;
  return false;
}
