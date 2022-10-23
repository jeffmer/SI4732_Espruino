class BarDisp {
    constructor(str,x,y,v,fn){
      this.x=x; this.y=y;
      this.str=str; 
      this.v=v;
      this.old=0;
      this.press=false;
      this.focusd = false;
      this.press = false;
      this.fn = fn;
    }

    update(v){
        if (v>=this.old) g.setColor(this.press?Green:Grey).fillRect(this.x,this.y+1,this.x+v,this.y+5);
        if (v<this.old) g.clearRect(this.x+v,this.y+1,this.x+63,this.y+5);
        this.old=v; this.v=v;
    }

    draw(){
        g.setColor(Yellow).setFont("6x8",1).setFontAlign(1,-1).drawString(this.str,this.x-3,this.y);
        g.setColor(this.focusd?-1:Grey).drawRect(this.x-1,this.y,this.x+64,this.y+6);
        this.update(this.v);
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

