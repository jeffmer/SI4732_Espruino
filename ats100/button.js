
class Button {
  constructor(str,x,y,w,h,fn,fz){
    this.x1=x; this.y1=y;
    this.w=w; this.h=h;
    this.x2=this.x1+this.w-1; this.y2=this.y1+this.h-1;
    this.str=str; this.fn=fn;
    this.press=false;
    this.fz = fz?fz:12;
    this.focusd = false;
  }
  draw() {
      g.setColor(this.press?Green:Blue).fillRect(this.x1,this.y1,this.x2,this.y2);
      if (this.focusd)  g.setColor(-1). drawRect(this.x1,this.y1,this.x2,this.y2);
      if (this.fz<12) g.setFont("6x8"); else g.setFont("Vector",this.fz);
      g.setColor(-1).setFontAlign(0,0).drawString(this.str,this.x1+this.w/2,this.y1+this.h/2);
    return this;
  }
  focus(b){
    this.focusd = b;
    this.draw();
  }
  toggle(b){
    if (b){
    this.press=!this.press;
    this.draw();
    } else {
     this.fn(this.press);
    }
  }
  reset(){
    this.press=false;
    this.draw();
  }
}
