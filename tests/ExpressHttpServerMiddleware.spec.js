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
      "expressMiddleware/cookieParser",
      "expressMiddleware/allowCrossDomain",
      { "source": "expressMiddleware/handleMongoSession", "dbname": "test-webcell", "cookie_secret": "test" },
      { "source": "expressMiddleware/bodyParser", "uploadDir": "tests/data/" },
      { "source": "expressMiddleware/handleI18Next", "localesDir": "tests/data/" },
      { "source": "expressMiddleware/staticFolder", "staticDir": "tests/data/" }
    ]
  };

  var sendUploadResultsMockup = function(req, res, next){
    res.send(req.files)
  }

  it("should emit HttpServer chemical in plasma once ready", function(next){
    plasma.once("ExpressServer", function(chemical){
      expect(chemical.data).toBe(httpServer.app);
      chemical.data.post("/upload", sendUploadResultsMockup)
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

  it("should handle uploading of files to public folder", function(next){
    var r = request.post('http://127.0.0.1:'+serverConfig.port+'/upload', function(err, res, body){
      body = JSON.parse(body)
      expect(body).toBeDefined();
      fs.unlinkSync(body.my_file.path)
      next();
    });
    var form = r.form()
    form.append('my_file', fs.createReadStream(path.join(__dirname, './data/file.txt')));
  });

  it("should kill", function(){
    plasma.emit("kill");
    expect(httpServer.closed).toBe(true);
  });

});
