/* Peak-phasor, lossless transmission-line model. Also used by the numerical tests. */
(function(global){
'use strict';
const C=(re=0,im=0)=>({re,im});
const add=(a,b)=>C(a.re+b.re,a.im+b.im),sub=(a,b)=>C(a.re-b.re,a.im-b.im);
const mul=(a,b)=>C(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re);
const abs=a=>Math.hypot(a.re,a.im),scale=(a,k)=>C(a.re*k,a.im*k),exp=t=>C(Math.cos(t),Math.sin(t));
function div(a,b){const den=b.re*b.re+b.im*b.im;return den<1e-24?null:C((a.re*b.re+a.im*b.im)/den,(a.im*b.re-a.re*b.im)/den);}
function gamma(p){if(p.kind==='open')return C(1);if(p.kind==='short')return C(-1);return div(C(p.r-p.z0,p.x),C(p.r+p.z0,p.x));}
function atDistance(p,d){return mul(gamma(p),exp(-4*Math.PI*d));}
function impedance(g,z0){return div(scale(add(C(1),g),z0),sub(C(1),g));}
function waves(p,f,t){const d=2*Math.PI*p.length*(1-f),forward=exp(d),reflected=mul(gamma(p),exp(-d)),v=add(forward,reflected),i=sub(forward,reflected),time=exp(t);return{v,i,vf:mul(forward,time).re,vr:mul(reflected,time).re,jf:mul(forward,time).re,jr:-mul(reflected,time).re,vt:mul(v,time).re,jt:mul(i,time).re};}
function voltageReference(p){
 const g=gamma(p),angle=Math.atan2(g.im,g.re),distances=[p.length,0];
 for(let n=-Math.ceil(2*p.length)-2;n<=Math.ceil(2*p.length)+2;n++){
  const d=(angle+2*Math.PI*n)/(4*Math.PI);if(d>=0&&d<=p.length)distances.push(d);
 }
 let best=null;
 for(const d of distances){const f=p.length?1-d/p.length:0,v=waves(p,f,0).v;
  if(!best||abs(v)>best.magnitude+1e-12)best={offset:-Math.atan2(v.im,v.re),position:f,magnitude:abs(v)};
 }
 return best;
}
function sourcePower(p,rs,vs=1){const g=atDistance(p,p.length),den=add(add(C(1),g),scale(sub(C(1),g),rs/p.z0));return vs*vs/(abs(den)**2*p.z0)*(1-abs(gamma(p))**2);}
const api={C,add,sub,mul,div,abs,scale,exp,gamma,atDistance,impedance,waves,voltageReference,sourcePower};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else global.TLPhysics=api;
})(typeof window!=='undefined'?window:globalThis);
