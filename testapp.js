Graphics.prototype.drawRotRect = function(w, r1, r2, angle) {
    var w2=w/2, h=r2-r1, theta=angle*Math.PI/180;
    return this.fillPoly(this.transformVertices([-w2,0,-w2,-h,w2,-h,w2,0], 
        {x:cx+r1*Math.sin(theta),y:cy-r1*Math.cos(theta),rotate:theta}));
};


g.clear();
var count = 0;
var oldcount=0;
var cx = 160, cy = 120, h= 240;

var buf = Graphics.createArrayBuffer(100,50,1,{msb:true});
function flip(){
  g.setColor(-1).drawImage(buf,cx-50,cy-25);
}


function display(i){
  //var start=Date.now();
  count+=i;
  count = count<0?0:count>270?270:count;
  buf.clearRect(0,0,99,49);
  buf.setColor(-1);
  buf.setFont("Vector",48).setFontAlign(0,0).drawString(count,50,25);
  flip();
  if(i>0)
    g.setColor(0,1,0).drawRotRect(3,110,121,count+225);
  else
    g.setColor(0.7,0.7,0.7).drawRotRect(3,110,121,count+226);
  //console.log("Time",Math.floor(Date.now()-start));
}

/*
function display(i){
  var start=Date.now();
  count+=i*10;
  count = count<0?0:count>270?270:count;
  buf.clearRect(0,0,99,49);
  buf.setColor(-1);
  buf.setFont("Vector",48).setFontAlign(0,0).drawString(count,50,25);
  flip();
  if(i>0)
    for (var a=oldcount;a<count;a++) g.setColor(0,1,0).drawRotRect(3,110,121,a+225);
  else
    for (var a=oldcount;a>count;a--) g.setColor(0.7,0.7,0.7).drawRotRect(3,110,121,a+226);
  oldcount=count;
  console.log("Time",Math.floor(Date.now()-start));
}
*/


g.setColor(0.7,0.7,0.7).fillCircle(cx,cy,h/2);
g.setColor(g.theme.bg).fillCircle(cx,cy,h/2-10).fillRect(0,h-36,319,h-1);
display(0);


ROTARY.on("change",display);


g.setColor(1,1,0);
g.fillCircle(20,20,5);
g.fillCircle(300,20,5);
g.fillCircle(20,220,5);
g.fillCircle(300,220,5);
//g.fillCircle(160,120,5);

TC.on("touch", (p)=>{
    console.log("touch x: "+p.x+" y:"+p.y);
});

TC.on("swipe", (d)=>{
    console.log("swipe d: "+d);
    if (d==TC.UP) display(+10);
    if (d==TC.DOWN) display(-10);
});

TC.on("longtouch", (p)=>{
    console.log("long touch");
});

function timeit(){
  var start=Date.now();
  g.clear();
return Math.floor(Date.now()-start);
}
  


