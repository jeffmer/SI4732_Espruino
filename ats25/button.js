
class Button {
  constructor(str,x,y,w,h,fn,fz){
    this.x1=x; this.y1=y;
    this.w=w; this.h=h;
    this.x2=this.x1+this.w-1; this.y2=this.y1+this.h-1;
    this.str=str; this.fn=fn;
    this.press=false;
    this.fz = fz?fz:18;
  }
  draw() {
      g.setColor(this.press?Green:Blue).fillRect({x:this.x1,y:this.y1,x2:this.x2,y2:this.y2,r:10});
      g.setColor(-1).setFont("Vector",this.fz).setFontAlign(0,0).drawString(this.str,this.x1+this.w/2,this.y1+this.h/2);
    return this;
  }
  isTouched(p){
      return (p.x>this.x1 && p.x<this.x2 && p.y>this.y1 && p.y<this.y2);
  }
  action(){
    this.set();
    setTimeout(()=>{
      this.reset();
       this.fn(this.str);
    },200);
  }
  toggle(){
    this.press=!this.press;
    this.draw();
    this.fn(this.press);
  }
  set(){
    this.press=true;
    this.draw();
  }
  reset(){
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
