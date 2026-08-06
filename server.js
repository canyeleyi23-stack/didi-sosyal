const http = require("http");
const { URL } = require("url");
const config = require("./src/config");
const { json, serveStatic } = require("./src/lib/http");
const { handleApi } = require("./src/routes/api");
const realtime = require("./src/lib/realtime");
const { rateLimit } = require("./src/lib/rateLimit");

const server = http.createServer(async (req,res)=>{
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (!rateLimit(req,res,json)) return;
    if (req.method==="GET" && url.pathname==="/api/events-stream") {
      res.writeHead(200,{"Content-Type":"text/event-stream","Cache-Control":"no-cache","Connection":"keep-alive"});
      realtime.add(res);
      req.on("close",()=>realtime.remove(res));
      return;
    }
    if (config.maintenanceMode && !url.pathname.startsWith("/api/health") && !url.pathname.startsWith("/maintenance")) {
      if (url.pathname.startsWith("/api/")) return json(res,503,{error:"Bakım modu aktif"});
      url.pathname="/maintenance.html";
    }
    if (url.pathname.startsWith("/api/")) return await handleApi(req,res,url);
    return serveStatic(req,res,url);
  } catch (error) {
    console.error(error);
    return json(res,error.status||500,{error:error.message||"Sunucu hatası"});
  }
});
server.listen(config.port,config.host,()=>{
  console.log(`DİDİ Sosyal Beta 1.3 sunucusu çalışıyor.`);
  console.log(`Tarayıcı: http://localhost:${config.port}`);
  console.log(`Alternatif: http://127.0.0.1:${config.port}`);
  console.log(`Dinleme adresi: http://${config.host}:${config.port}`);
});
