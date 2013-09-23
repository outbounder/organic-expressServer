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
  this.mountHttpRoutes();
  this.mountXware(this.config.afterware);
  
  this.on("kill", this.close);

  config.port = config.port || 1337;

  this.server = app.listen(config.port, function(){
    if(config.log)
      console.log('HttpServer running at http://127.0.0.1:'+config.port+'/');  
    self.emit(new Chemical("HttpServer", self));
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
      console.log("middleware: ",middlewareSource, JSON.stringify(middlewareConfig).yellow);
    try {
      var middlewareFunc = require(middlewareSource)(middlewareConfig, self);
      if(middlewareFunc)
        self.app.use(middlewareFunc);
    } catch(err){
      console.log(err)
    }
  });
}

module.exports.prototype.mountHttpRoutes = function(){
  if(!this.config.routes) return;

  var self = this;
  _.each(this.config.routes, function(chemicalAddons, path){
    if(self.config.log)
      console.log("route: ",path.green, JSON.stringify(chemicalAddons).yellow);
    self.app.all(path, function(req, res){ self.handleIncomingRequest(chemicalAddons, req, res); });  
  });

  if(this.config.notfoundRoute) {
    this.app.all("*", function(req, res){
      self.handleIncomingRequest(self.config.notfoundRoute, req, res);
    });
  }
}

module.exports.prototype.handleIncomingRequest = function(chemicalAddons, req, res){
  var chemical = new Chemical();
  
  chemical.req = req;
  chemical.res = res;
  _.extend(chemical, JSON.parse(JSON.stringify(chemicalAddons))); // better way to do it?

  // finally emit to the plasma
  this.emit(chemical, function(response){
    if(response['content-type'])
      res.header('Content-type', response['content-type']);
    if(response.data instanceof Buffer) {
      res.write(response.data);
      res.end();
    } else {
      res.send(response.data, response.statusCode || 200);
    }
  });
}

module.exports.prototype.close = function(chemical){
  if(this.closed) return;
  this.server.close();
  this.closed = true;
  return false;
}