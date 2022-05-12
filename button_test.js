



const Grey = g.toColor(0.6,0.6,0.6);
const Green = g.toColor(0,1,0);
const Yellow = g.toColor(1,1,0);
const Blue = g.toColor(0,0,1);
var buf = Graphics.createArrayBuffer(160,50,1,{msb:true});
var TUNEVOL=true;
var LOWBAND = 8750;
var HIGHBAND = 10790;

function drawFreq(f){
  buf.clear();
  buf.setFont("Vector",32).setFontAlign(1,0).drawString((f/100).toFixed(1),135,25);
  g.setColor(f<=HIGHBAND&&f>=LOWBAND?Green:-1).drawImage(buf,80,5);
}

class Button {
    constructor(str,x,y,w,h,fn){
      this.x1=x; this.y1=y;
      this.w=w; this.h=h;
      this.x2=this.x1+this.w-1; this.y2=this.y1+this.h-1;
      this.str=str; this.fn=fn;
      this.press=false;
    }
    draw() {
        g.setColor(this.press?Green:Blue).fillRect({x:this.x1,y:this.y1,x2:this.x2,y2:this.y2,r:10});
        g.setColor(-1).setFont("Vector",28).setFontAlign(0,0).drawString(this.str,this.x1+this.w/2,this.y1+this.h/2);
      return this;
    }
    isTouched(p){
        return (p.x>this.x1 && p.x<this.x2 && p.y>this.y1 && p.y<this.y2);
    }
    action(){
        this.press=true;
        this.draw();
        setTimeout(()=>this.clear(),200);
        this.fn(this.str);
    }
    clear(){
        this.press=false;
        this.draw();
    }
    actOnTouch(p){
      if (this.isTouched(p)) {
          this.action(p);
          return true;
      } else return false;

    }    
}


g.setColor(Grey).fillRect(0,0,319,219);



var KEYS = [];

var ACC=0;

function keyfn(s){
      if (s!="<")
          ACC=ACC*10+s;
      else
          ACC=Math.floor(ACC/10);
      drawFreq(ACC*10);
}



for (var j =0;j<3;j++)
for (var i =0;i<3;i++)
   KEYS[j*3+i+1] = new Button(j*3+i+1,80+55*i,60+j*41,50,36,keyfn).draw();
KEYS[0] = new Button(0,80,183,75,36,keyfn).draw();
KEYS[10] = new Button("<",165,183,75,36,keyfn).draw();
drawFreq(ACC*10);

TC.on("touch",(p)=> {for (var i =0;i<KEYS.length;i++) if (KEYS[i].actOnTouch(p)) return;});

