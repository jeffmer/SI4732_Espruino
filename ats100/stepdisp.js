


class StepDisp {
    constructor(x,y,d,fn){
        this.steps=[10000,1000,100,10];
        this.x=x;
        this.y=y;
        this.d = d;
        this.pos=1;
        this.buf = Graphics.createArrayBuffer(23*this.steps.length,this.d,1,{msb:true});
        this.focusd = false;
        this.fn = fn;
        this.press = false;
    }

    mod(a,n) {return a>=n?a-n:a<0?a+n:a;}

    draw() { 
        this.buf.clear();
        var sx = this.pos*23;
        this.buf.fillRect(sx,0,sx+16,this.d-1);
        g.setBgColor(this.focusd?DarkGrey:0).setColor(this.press?-1:Cyan).drawImage(this.buf,this.x,this.y);
        g.setBgColor(0);
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
    move(inc){
        if (this.steps.length==0) return;
        this.pos=this.mod(this.pos+inc,this.steps.length);
        this.draw(true);
    }

    step(){
        return this.steps[this.pos];
    }

}

