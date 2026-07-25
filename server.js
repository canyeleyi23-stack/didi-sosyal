const express=require("express");
const session=require("express-session");
const bcrypt=require("bcryptjs");
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");

const app=express();
const PORT=Number(process.env.PORT||3001);
const DATA=path.join(__dirname,"data");
const USERS=path.join(DATA,"users.json");
const POSTS=path.join(DATA,"posts.json");
const MESSAGES=path.join(DATA,"messages.json");
const NOTIFICATIONS=path.join(DATA,"notifications.json");
const STORIES=path.join(DATA,"stories.json");
const GROUPS=path.join(DATA,"groups.json");
const MARKET=path.join(DATA,"market.json");

app.use(express.json({limit:"120mb"}));
app.use(express.urlencoded({extended:true,limit:"120mb"}));
app.use(session({
  secret:process.env.SESSION_SECRET||"didi-social-change-this-secret",
  resave:false,saveUninitialized:false,
  cookie:{httpOnly:true,sameSite:"lax",secure:false,maxAge:1000*60*60*24*7}
}));
app.use(express.static(path.join(__dirname,"public")));

const read=(file,fallback)=>{try{return JSON.parse(fs.readFileSync(file,"utf8"))}catch{return fallback}};
const write=(file,data)=>{const tmp=file+".tmp";fs.writeFileSync(tmp,JSON.stringify(data,null,2),"utf8");fs.renameSync(tmp,file)};
const id=()=>crypto.randomUUID();
const now=()=>new Date().toLocaleString("tr-TR");
const safeUser=u=>({id:u.id,name:u.name,username:u.username,email:u.email,role:u.role,active:u.active,verified:u.verified});
const auth=(req,res,next)=>{const users=read(USERS,[]);const u=users.find(x=>x.id===req.session.userId&&x.active);if(!u)return res.status(401).json({ok:false,message:"Oturum açmalısınız."});req.user=u;next()};
const admin=(req,res,next)=>{if(!["OWNER","ADMIN"].includes(req.user.role))return res.status(403).json({ok:false,message:"Yönetici yetkisi gerekli."});next()};
function addNotification(userId,title,text){const all=read(NOTIFICATIONS,[]);all.unshift({id:id(),userId,title,text,time:now(),read:false});write(NOTIFICATIONS,all.slice(0,3000))}
function seed(){
  let users=read(USERS,[]);
  if(!users.length){
    users=[{id:id(),name:"DİDİ Sahibi",username:"@owner",email:"owner@didi.local",password:bcrypt.hashSync("Didi1234!",10),role:"OWNER",active:true,verified:true,bio:"DİDİ Sosyal platform sahibi.",location:"Türkiye",following:[],saved:[]}];
    write(USERS,users);
  }
  if(!fs.existsSync(POSTS))write(POSTS,[
    {id:id(),userId:"system",name:"DİDİ Sosyal",user:"@didisocial",initials:"D",verified:true,time:"şimdi",text:"DİDİ Sosyal Pro 9.0 yayında. Gerçek üyelik, mesaj, bildirim ve yönetim sistemi aktif.",likesBy:[],comments:[],shares:0}
  ]);
  if(!fs.existsSync(MESSAGES))write(MESSAGES,[]);
  if(!fs.existsSync(NOTIFICATIONS))write(NOTIFICATIONS,[]);
  if(!fs.existsSync(STORIES))write(STORIES,[]);
  if(!fs.existsSync(GROUPS))write(GROUPS,[
    {id:"g1",name:"DİDİ Teknoloji",initials:"DT",members:245,memberIds:[]},
    {id:"g2",name:"DİDİ TV Topluluğu",initials:"TV",members:418,memberIds:[]},
    {id:"g3",name:"İçerik Üreticileri",initials:"İÜ",members:172,memberIds:[]}
  ]);
  if(!fs.existsSync(MARKET))write(MARKET,[
    {id:"m1",title:"Profesyonel Mikrofon",price:"2.750 TL",location:"İstanbul",image:"https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80"},
    {id:"m2",title:"Video Işık Seti",price:"1.450 TL",location:"Ankara",image:"https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80"}
  ]);
}
seed();

app.get("/api/health",(_q,r)=>r.json({ok:true,name:"DİDİ Sosyal Pro",version:"10.0.0"}));
app.post("/api/auth/register",async(req,res)=>{
  const name=String(req.body.name||"").trim(), username="@"+String(req.body.username||"").replace(/^@/,"").replace(/\s+/g,"").toLowerCase(), email=String(req.body.email||"").trim().toLowerCase(), password=String(req.body.password||"");
  if(!name||username==="@"||!email||password.length<6)return res.status(400).json({ok:false,message:"Bilgileri eksiksiz doldurun."});
  const users=read(USERS,[]);if(users.some(u=>u.email===email||u.username===username))return res.status(409).json({ok:false,message:"E-posta veya kullanıcı adı kullanılıyor."});
  const u={id:id(),name,username,email,password:await bcrypt.hash(password,10),role:"USER",active:true,verified:false,bio:"",location:"Türkiye",following:[],saved:[]};
  users.push(u);write(USERS,users);req.session.userId=u.id;addNotification(u.id,"Hoş geldiniz","DİDİ Sosyal hesabınız oluşturuldu.");res.json({ok:true,user:safeUser(u)});
});
app.post("/api/auth/login",async(req,res)=>{
  const users=read(USERS,[]),email=String(req.body.email||"").toLowerCase(),u=users.find(x=>x.email===email);
  if(!u||!u.active||!(await bcrypt.compare(String(req.body.password||""),u.password)))return res.status(401).json({ok:false,message:"E-posta veya şifre hatalı."});
  req.session.userId=u.id;res.json({ok:true,user:safeUser(u)});
});
app.post("/api/auth/logout",(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get("/api/auth/me",auth,(req,res)=>res.json({ok:true,user:safeUser(req.user),profile:{name:req.user.name,username:req.user.username,initials:req.user.name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase(),bio:req.user.bio||"",location:req.user.location||""}}));

app.get("/api/posts",auth,(req,res)=>{
  const posts=read(POSTS,[]).map(p=>({...p,likes:(p.likesBy||[]).length,liked:(p.likesBy||[]).includes(req.user.id),saved:(req.user.saved||[]).includes(p.id),owner:p.userId===req.user.id||["OWNER","ADMIN"].includes(req.user.role)}));
  res.json({ok:true,posts});
});
app.post("/api/posts",auth,(req,res)=>{
  const all=read(POSTS,[]);const p={id:id(),userId:req.user.id,name:req.user.name,user:req.user.username,initials:req.user.name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase(),verified:req.user.verified,time:"şimdi",text:String(req.body.text||"").slice(0,2000),media:req.body.media||null,poll:req.body.poll||null,likesBy:[],comments:[],shares:0};all.unshift(p);write(POSTS,all);res.json({ok:true,post:p});
});
app.put("/api/posts/:id",auth,(req,res)=>{const all=read(POSTS,[]),p=all.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({ok:false,message:"Gönderi bulunamadı."});if(p.userId!==req.user.id&&!["OWNER","ADMIN"].includes(req.user.role))return res.status(403).json({ok:false,message:"Yetkiniz yok."});p.text=String(req.body.text||"").slice(0,2000);write(POSTS,all);res.json({ok:true})});
app.delete("/api/posts/:id",auth,(req,res)=>{let all=read(POSTS,[]);const p=all.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({ok:false,message:"Gönderi bulunamadı."});if(p.userId!==req.user.id&&!["OWNER","ADMIN"].includes(req.user.role))return res.status(403).json({ok:false,message:"Yetkiniz yok."});all=all.filter(x=>x.id!==p.id);write(POSTS,all);res.json({ok:true})});
app.post("/api/posts/:id/like",auth,(req,res)=>{const all=read(POSTS,[]),p=all.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({ok:false,message:"Gönderi bulunamadı."});p.likesBy=p.likesBy||[];const i=p.likesBy.indexOf(req.user.id);i>=0?p.likesBy.splice(i,1):p.likesBy.push(req.user.id);write(POSTS,all);if(i<0&&p.userId!=="system"&&p.userId!==req.user.id)addNotification(p.userId,"Yeni beğeni",`${req.user.name} gönderinizi beğendi.`);res.json({ok:true})});
app.post("/api/posts/:id/comments",auth,(req,res)=>{const all=read(POSTS,[]),p=all.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({ok:false,message:"Gönderi bulunamadı."});p.comments=p.comments||[];p.comments.push({id:id(),userId:req.user.id,name:req.user.name,initials:req.user.name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase(),text:String(req.body.text||"").slice(0,500)});write(POSTS,all);if(p.userId!=="system"&&p.userId!==req.user.id)addNotification(p.userId,"Yeni yorum",`${req.user.name} gönderinize yorum yaptı.`);res.json({ok:true})});
app.post("/api/posts/:id/save",auth,(req,res)=>{const users=read(USERS,[]),u=users.find(x=>x.id===req.user.id);u.saved=u.saved||[];const i=u.saved.indexOf(req.params.id);i>=0?u.saved.splice(i,1):u.saved.push(req.params.id);write(USERS,users);res.json({ok:true,saved:i<0})});
app.post("/api/posts/:id/share",auth,(req,res)=>{const all=read(POSTS,[]),p=all.find(x=>x.id===req.params.id);if(p){p.shares=(p.shares||0)+1;write(POSTS,all)}res.json({ok:true})});
app.post("/api/posts/:id/poll",auth,(req,res)=>{const all=read(POSTS,[]),p=all.find(x=>x.id===req.params.id),i=Number(req.body.index);if(!p?.poll?.options?.[i])return res.status(400).json({ok:false,message:"Anket seçeneği geçersiz."});p.poll.options[i].voters=p.poll.options[i].voters||[];if(p.poll.options.some(o=>(o.voters||[]).includes(req.user.id)))return res.status(409).json({ok:false,message:"Bu ankete zaten oy verdiniz."});p.poll.options[i].voters.push(req.user.id);p.poll.options[i].votes=p.poll.options[i].voters.length;write(POSTS,all);res.json({ok:true})});

app.put("/api/profile",auth,(req,res)=>{const users=read(USERS,[]),u=users.find(x=>x.id===req.user.id);const username="@"+String(req.body.username||"").replace(/^@/,"").replace(/\s+/g,"").toLowerCase();if(users.some(x=>x.id!==u.id&&x.username===username))return res.status(409).json({ok:false,message:"Kullanıcı adı kullanımda."});u.name=String(req.body.name||u.name).slice(0,80);u.username=username;u.bio=String(req.body.bio||"").slice(0,500);u.location=String(req.body.location||"").slice(0,100);write(USERS,users);const all=read(POSTS,[]);all.forEach(p=>{if(p.userId===u.id){p.name=u.name;p.user=u.username;p.initials=u.name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}});write(POSTS,all);res.json({ok:true,profile:{name:u.name,username:u.username,initials:u.name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase(),bio:u.bio,location:u.location}})});
app.post("/api/follow",auth,(req,res)=>{const users=read(USERS,[]),u=users.find(x=>x.id===req.user.id),target=users.find(x=>x.username===String(req.body.username||""));if(!target)return res.status(404).json({ok:false,message:"Kullanıcı bulunamadı."});u.following=u.following||[];const i=u.following.indexOf(target.id);i>=0?u.following.splice(i,1):u.following.push(target.id);write(USERS,users);if(i<0)addNotification(target.id,"Yeni takipçi",`${u.name} sizi takip etti.`);res.json({ok:true,following:i<0})});

app.get("/api/notifications",auth,(req,res)=>{const all=read(NOTIFICATIONS,[]),items=all.filter(x=>x.userId===req.user.id);items.forEach(x=>x.read=true);write(NOTIFICATIONS,all);res.json({ok:true,notifications:items})});
app.get("/api/messages",auth,(req,res)=>{const all=read(MESSAGES,[]).filter(x=>x.fromId===req.user.id||x.toId===req.user.id).map(x=>({...x,from:x.fromName,to:x.toName}));res.json({ok:true,messages:all})});
app.post("/api/messages",auth,(req,res)=>{const users=read(USERS,[]),target=users.find(x=>x.username===String(req.body.to||""));if(!target)return res.status(404).json({ok:false,message:"Alıcı bulunamadı."});const all=read(MESSAGES,[]);all.unshift({id:id(),fromId:req.user.id,toId:target.id,fromName:req.user.username,toName:target.username,text:String(req.body.text||"").slice(0,1000),time:now(),read:false});write(MESSAGES,all);addNotification(target.id,"Yeni mesaj",`${req.user.name} size mesaj gönderdi.`);res.json({ok:true})});
app.get("/api/badges",auth,(req,res)=>{const n=read(NOTIFICATIONS,[]).filter(x=>x.userId===req.user.id&&!x.read).length,m=read(MESSAGES,[]).filter(x=>x.toId===req.user.id&&!x.read).length;res.json({ok:true,notifications:n,messages:m})});


app.put("/api/account/password",auth,async(req,res)=>{
  const users=read(USERS,[]),u=users.find(x=>x.id===req.user.id);
  if(!(await bcrypt.compare(String(req.body.oldPassword||""),u.password)))return res.status(400).json({ok:false,message:"Mevcut şifre yanlış."});
  const next=String(req.body.newPassword||"");
  if(next.length<6)return res.status(400).json({ok:false,message:"Yeni şifre en az 6 karakter olmalı."});
  u.password=await bcrypt.hash(next,10);write(USERS,users);res.json({ok:true});
});
app.get("/api/saved",auth,(req,res)=>{
  const ids=req.user.saved||[],all=read(POSTS,[]);
  const posts=all.filter(p=>ids.includes(p.id)).map(p=>({...p,likes:(p.likesBy||[]).length,liked:(p.likesBy||[]).includes(req.user.id),saved:true,owner:p.userId===req.user.id||["OWNER","ADMIN"].includes(req.user.role)}));
  res.json({ok:true,posts});
});
app.get("/api/reels",auth,(req,res)=>{
  const posts=read(POSTS,[]).filter(p=>p.media&&p.media.type==="video").map(p=>({id:p.id,src:p.media.src,name:p.name,username:p.user,text:p.text}));
  res.json({ok:true,reels:posts});
});
app.get("/api/stories",auth,(req,res)=>{
  const cutoff=Date.now()-24*60*60*1000;
  let all=read(STORIES,[]).filter(s=>s.createdAt>cutoff);write(STORIES,all);
  res.json({ok:true,stories:all});
});
app.post("/api/stories",auth,(req,res)=>{
  const src=String(req.body.src||"");if(!src.startsWith("data:"))return res.status(400).json({ok:false,message:"Hikâye medyası geçersiz."});
  const all=read(STORIES,[]);all.unshift({id:id(),userId:req.user.id,name:req.user.name,initials:req.user.name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase(),type:req.body.type==="video"?"video":"image",src,createdAt:Date.now()});write(STORIES,all.slice(0,200));res.json({ok:true});
});
app.get("/api/groups",auth,(req,res)=>{
  const groups=read(GROUPS,[]).map(g=>({...g,joined:(g.memberIds||[]).includes(req.user.id)}));res.json({ok:true,groups});
});
app.post("/api/groups/:id/join",auth,(req,res)=>{
  const groups=read(GROUPS,[]),g=groups.find(x=>x.id===req.params.id);if(!g)return res.status(404).json({ok:false,message:"Grup bulunamadı."});
  g.memberIds=g.memberIds||[];const i=g.memberIds.indexOf(req.user.id);i>=0?g.memberIds.splice(i,1):g.memberIds.push(req.user.id);g.members=Math.max(0,(g.members||0)+(i>=0?-1:1));write(GROUPS,groups);res.json({ok:true,joined:i<0});
});
app.get("/api/market",auth,(req,res)=>res.json({ok:true,items:read(MARKET,[])}));

app.get("/api/admin",auth,admin,(req,res)=>{const users=read(USERS,[]),posts=read(POSTS,[]),messages=read(MESSAGES,[]);res.json({ok:true,stats:{"Üyeler":users.length,"Gönderiler":posts.length,"Mesajlar":messages.length,"Aktif kullanıcı":users.filter(x=>x.active).length},users:users.map(safeUser)})});
app.post("/api/admin/users/:id/toggle",auth,admin,(req,res)=>{const users=read(USERS,[]),u=users.find(x=>x.id===req.params.id);if(!u)return res.status(404).json({ok:false,message:"Kullanıcı bulunamadı."});if(u.role==="OWNER")return res.status(400).json({ok:false,message:"Sahip hesabı kapatılamaz."});u.active=!u.active;write(USERS,users);res.json({ok:true})});

app.get("*",(_q,r)=>r.sendFile(path.join(__dirname,"public","index.html")));
app.use((e,_q,r,_n)=>r.status(500).json({ok:false,message:e.message||"Sunucu hatası"}));
app.listen(PORT,"0.0.0.0",()=>console.log(`DİDİ Sosyal Pro 10.0: http://localhost:${PORT}`));
