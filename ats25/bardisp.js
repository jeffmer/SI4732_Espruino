class BarDisp {
    constructor(str,x,y,v){
      this.x=x; this.y=y;
      this.str=str; 
      this.v=v;
      this.old=0;
    }

    update(v){
        if (v>=this.old) g.setColor(Green).fillRect(this.x,this.y+1,this.x+v,this.y+7);
        if (v<this.old) g.clearRect(this.x+v,this.y+1,this.x+63,this.y+7);
        this.old=v; this.v=v;
    }

    draw(){
        g.setColor(Yellow).setFont("6x8",1).setFontAlign(1,-1).drawString(this.str,this.x-3,this.y);
        g.setColor(-1).drawRect(this.x-1,this.y,this.x+64,this.y+8);
        this.update(this.v);
    }
}

