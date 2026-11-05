import * as T from './vendor/three-r170/three.module.min.js';
export async function mountPortrait(stage){
 const viewport=stage.querySelector('[data-portrait-viewport]'),status=stage.querySelector('[data-portrait-status]'),controls=stage.querySelector('[data-portrait-controls]');
 try{
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=T.SRGBColorSpace; viewport.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,100); camera.position.set(0,.12,7.8);
 scene.add(new T.HemisphereLight(0xffffff,0x47365e,2)); const light=new T.DirectionalLight(0xffe8cf,2.5);light.position.set(-3,5,5);scene.add(light);
 const mat=(c,r=.8)=>new T.MeshStandardMaterial({color:c,roughness:r}); const skin=mat(0x9b603f),hair=mat(0x171519),shirt=mat(0x17151d),frame=mat(0x14131c),white=mat(0xf9eee4),iris=mat(0x2c1d17);
 function ball(parent,m,x,y,z,sx,sy,sz){const o=new T.Mesh(new T.SphereGeometry(1,32,24),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o}
 const bust=new T.Group();scene.add(bust); ball(bust,shirt,0,-1.48,0,1.4,.85,.58);ball(bust,skin,0,-.82,0,.37,.55,.34);
 const head=new T.Group();head.position.y=.15;bust.add(head);ball(head,skin,0,0,0,.73,.95,.60);ball(head,skin,-.72,-.08,0,.13,.23,.13);ball(head,skin,.72,-.08,0,.13,.23,.13);
 ball(head,hair,0,.76,-.02,.73,.30,.59);ball(head,hair,-.63,.48,-.02,.12,.36,.49);ball(head,hair,.63,.48,-.02,.12,.36,.49);
 // Beard and moustache follow the lower face; mouth and nose remain visible.
 ball(head,hair,0,-.48,.18,.67,.48,.47);ball(head,skin,0,-.25,.54,.43,.32,.12);ball(head,skin,0,-.12,.62,.12,.20,.16);ball(head,hair,-.16,-.36,.66,.19,.065,.07);ball(head,hair,.16,-.36,.66,.19,.065,.07);ball(head,mat(0x663a31),0,-.49,.65,.16,.035,.025);
 const eyes=[];for(const x of [-.29,.29]){const eye=ball(head,white,x,.15,.535,.18,.105,.07);eyes.push(eye);ball(head,iris,x,.15,.603,.064,.068,.025);ball(head,frame,x,.15,.627,.03,.038,.012);const ring=new T.Mesh(new T.TorusGeometry(.225,.034,12,48),frame);ring.position.set(x,.15,.61);ring.scale.y=.76;head.add(ring);}
 ball(head,frame,0,.15,.62,.09,.025,.025);for(const x of [-.64,.64])ball(head,frame,x,.17,.28,.025,.025,.36);
 const canvas=renderer.domElement;canvas.style.touchAction='pan-y';canvas.setAttribute('aria-label','Stylized animated 3D portrait of Punith; drag to rotate');canvas.setAttribute('role','img');let angle=0,drag=null;
 canvas.addEventListener('pointerdown',e=>{drag=e.clientX;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(drag!==null){angle+=(e.clientX-drag)*.01;drag=e.clientX}});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
 stage.querySelector('[data-rotate-left]').onclick=()=>angle-=Math.PI/8;stage.querySelector('[data-rotate-right]').onclick=()=>angle+=Math.PI/8;stage.querySelector('[data-reset-portrait]').onclick=()=>angle=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');function resize(){let w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(viewport);resize();
 stage.dataset.state='ready';controls.hidden=false;status.textContent='Stylized 3D portrait · drag to rotate';let start=performance.now();function draw(now){const t=(now-start)/1000;head.rotation.y=angle+(reduced.matches?0:Math.sin(t*.55)*.12);head.rotation.z=reduced.matches?0:Math.sin(t*.7)*.025;const blink=reduced.matches?1:(t%5<.14?.15:1);eyes.forEach(e=>e.scale.y=.105*blink);renderer.render(scene,camera);requestAnimationFrame(draw)}requestAnimationFrame(draw);
 }catch(e){stage.dataset.state='fallback';status.textContent='3D unavailable · showing photo';console.warn(e)}
}