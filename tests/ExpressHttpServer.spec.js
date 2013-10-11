var HttpServer = require("../index");
var Plasma = require("organic").Plasma;
var request = require("request");

describe("HttpServer", function(){

  var plasma = new Plasma();

  var httpServer;
  var serverConfig = {
    "port": 8080
  };

  it("should emit ExpressServer chemical in plasma once ready", function(next){

    plasma.once("ExpressServer", function(chemical){
      expect(chemical.data).toBe(httpServer.app);
      plasma.emit("kill");
      expect(httpServer.closed).toBe(true);
      next();
    });

    httpServer = new HttpServer(plasma, serverConfig);
    expect(httpServer).toBeDefined();
  });

  it("should emit HttpServer chemical in plasma once ready", function(next){

    plasma.once("HttpServer", function(chemical){
      expect(chemical.data).toBe(httpServer.server);
      plasma.emit("kill");
      expect(httpServer.closed).toBe(true);
      next();
    });

    serverConfig.emitServer = "HttpServer"
    httpServer = new HttpServer(plasma, serverConfig);
    expect(httpServer).toBeDefined();
  });

});
