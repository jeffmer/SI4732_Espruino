class FreqDisp {
    constructor(str,x,y,w,fz,f,fn){
      this.x=x; this.y=y; this.w = w; this.fz = fz;
      this.str=str; 
      this.f=f;
      this.press=false;
      this.focusd = false;
      this.press = false;
      this.fn = fn;
      this.buf = Graphics.createArrayBuffer(w,fz+2,1,{msb:true});
    }

    update(f){
        this.f=f;
        this.buf.clear();
        this.buf.setFont("Vector",this.fz).setFontAlign(1,1).drawString((f/100).toFixed(1),this.w-1,this.fz-2);
        g.setColor(this.press?-1:Cyan).drawImage(this.buf,this.x,this.y);
      }

    draw(){
        g.setColor(this.press?-1:Cyan).setFont("Vector",14).setFontAlign(-1,1).drawString(this.str,this.x+this.w,this.y+this.fz-4);
        this.update(this.f);
        g.setColor(this.focusd?Cyan:0).drawLine(this.x,this.y+this.fz+1,this.x+this.w,this.y+this.fz+1);
    }

    focus(b){
        this.focusd = b;
        this.draw();
    }
    toggle(){
        this.press=!this.press;
        this.draw();
        this.fn(this.press);
      }
}
