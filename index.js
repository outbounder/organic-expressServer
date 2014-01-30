var util = require("util");
var _ = require("underscore");
var fs = require("fs");
var path = require("path")
var express = require("express")

var Chemical = require("organic").Chemical;
var Organel = require("organic").Organel;

module.exports = function ExpressHttpServer(plasma, config){
  Organel.call(this, plasma);

  config.port = config.port || 1337;
  this.config = config;

  var app = this.app = express();
  
  this.mountXware(this.config.middleware);
  this.app.use(this.app.router);
  this.mountXware(this.config.afterware);

  this.on("kill", this.close);
  if(this.config.reactOn)  
    this.on(this.config.reactOn, this.listen)
  else
    this.listen()
}

util.inherits(module.exports, Organel);

module.exports.prototype.listen = function(){
  var self = this
  this.server = this.app.listen(this.config.port, function(){
    if(self.config.log)
      console.log('ExpressHttpServer running at', self.config.port);
    self.emit(new Chemical(self.config.emitReady || "ExpressServer", self.app));
    if(self.config.emitServer)
      self.emit(new Chemical(self.config.emitServer || "HttpServer", self.server))
  });
  return false
}

module.exports.prototype.mountXware = function(definitions){
  if(!definitions) return;

  var self = this;
  _.each(definitions, function(definition){

    var middlewareSource = definition.source || definition;
    var middlewareConfig = definition.source?definition:{};
    if(middlewareSource.indexOf("/") !== 0 || middlewareSource.indexOf(":\\") != 1)
      middlewareSource = process.cwd()+"/"+middlewareSource;

    if(self.config.log)
      console.log("xware", path.basename(middlewareSource));
    try {
      var middlewareBuilder = require(middlewareSource);

      var middlewareFunc
      if(middlewareBuilder.length != 3)
        middlewareFunc = middlewareBuilder(middlewareConfig, self)
      else
        middlewareFunc = middlewareBuilder
      
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
