var HttpServer = require("../index");
var Plasma = require("organic").Plasma;
var request = require("request");
var path = require("path");
var fs = require("fs");
var _ = require("underscore");

describe("HttpServer", function(){

  var plasma = new Plasma();

  var httpServer;
  var serverConfig = {
    "port": 8090,
    "middleware": [
      {
        "source": "node_modules/express/node_modules/connect/lib/middleware/cookieParser",
        "arguments": ["secret"]
      },
      { 
        "source": "node_modules/express/node_modules/connect/lib/middleware/bodyParser",
        "arguments": []
      },
      {
        "source": "xware/allowCrossDomain",
        "arguments": [],
      },
      { 
        "source": "xware/mongoSessions", 
        "arguments": [
          { "dbname": "test-webcell", "cookie_secret": "test" } 
        ]
      }
    ]
  };

  it("should emit HttpServer chemical in plasma once ready", function(next){
    plasma.once("ExpressServer", function(chemical){
      expect(chemical.data).toBe(httpServer.app);
      chemical.data.post("/post", function(req, res, next){
        res.send(req)
      })
      next();
    });

    httpServer = new HttpServer(plasma, serverConfig);
    expect(httpServer).toBeDefined();
  });

  it("should receive post requests", function(next){
    request.post("http://127.0.0.1:"+serverConfig.port+"/post", {form:{myData: "value"}}, function(err, res, body){
      expect(body).toBeDefined();
      next();
    });
  });

  it("should serve files from public folder", function(next){
    request("http://127.0.0.1:"+serverConfig.port+"/file.txt", function(err, res, body){
      expect(body).toBeDefined();
      next();
    });
  });

  it("should kill", function(){
    plasma.emit("kill");
    expect(httpServer.closed).toBe(true);
  });

});
