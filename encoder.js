function createEncoder(pinA,pinB){
  pinMode(pinA,"input_pullup");
  pinMode(pinB,"input_pullup"); 
  var a0=pinA.read(), c0=pinB.read(), incr0 =0, second=false;
  var OBJ = {};

 function handler () {
   var a = pinA.read();
   var b = pinB.read();
   if (a != a0) {              // A changed
     a0 = a;
     if (b != c0) {
       c0 = b;
       var incr = (a == b)?-1:1;
       if (incr!=incr0 || !second) OBJ.emit("change",incr);
       incr0=incr; second = !second;
     }
   }
 }
 setWatch(handler,pinA,{repeat:true,edge:"both"});
 return OBJ;
}



