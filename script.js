// =====================================================
// GSAP Page Transitions, Effects & Page-specific Logic
// =====================================================
(function(){
  const body = document.body;
  const page = document.documentElement.getAttribute('data-page');
  const cover = document.querySelector('.transition-cover');

  // ---------- Floating hearts (random messages) ----------
  const msgs = ['I ❤️ You','My Love','Always Yours','You + Me','Forever'];
  function floatingHeart(){
    const h = document.createElement('div');
    h.className = 'heart-trail';
    h.textContent = ['❤️','💕','💖','💘','💝'][Math.floor(Math.random()*5)];
    h.style.left = (10 + Math.random()*80) + 'vw';
    h.style.bottom = '-2em';
    h.style.fontSize = (18 + Math.random()*20) + 'px';
    h.style.opacity = 0;
    document.body.appendChild(h);
    gsap.to(h,{y:'-120vh',autoAlpha:1,duration:5+Math.random()*2,ease:'power1.out',onComplete:()=>h.remove()});
  }
  setInterval(()=>{ if(document.hasFocus()) floatingHeart(); }, 2000);

  // ---------- Heart trail cursor ----------
  window.addEventListener('pointermove', (e)=>{
    const s = document.createElement('div');
    s.className = 'heart-trail';
    s.textContent = '❤';
    s.style.left = e.clientX + 'px';
    s.style.top  = e.clientY + 'px';
    s.style.fontSize = (10 + Math.random()*10) + 'px';
    document.body.appendChild(s);
    gsap.to(s, {y:-40, autoAlpha:0, duration:0.8, ease:'power1.out', onComplete:()=>s.remove()});
  });

  // ---------- Secret LOVE note ----------
  const secret = document.createElement('div');
  secret.id = 'secret-note';
  secret.innerHTML = `
    <div class="card glass content center">
      <h2 class="title script">Hey love 💖</h2>
      <p class="subtitle">You make my world brighter every single day. Forever grateful for you.</p>
      <button class="btn" id="closeSecret">Close</button>
    </div>`;
  document.body.appendChild(secret);
  let keys = [];
  document.addEventListener('keydown', e=>{
    keys.push(e.key.toLowerCase());
    if(keys.join('').includes('love')){ secret.style.display='block'; keys=[]; }
    if(keys.length>10) keys.shift();
  });
  document.addEventListener('click', e=>{ if(e.target.id==='closeSecret') secret.style.display='none'; });

  // ---------- Page enter animation ----------
  function enter(){
    body.classList.add('page-enter');
    gsap.fromTo(cover, {autoAlpha:1}, {autoAlpha:0, duration:0.6, ease:'power2.out'});
    gsap.from('.card', {y:18, autoAlpha:0, duration:0.8, ease:'power3.out'});
    if(page==='index') gsapIntro();
    if(page==='cake') gsapCake();
    if(page==='celebrate') gsapCelebrate();
    if(page==='memory') gsapMemory();
    if(page==='final') gsapFinal();
    if(page==='special') gsapStars();
  }

  // ---------- Intercept transitions for smooth nav ----------
  document.addEventListener('click', (e)=>{
    const link = e.target.closest('.transition-link');
    if(!link) return;
    const next = link.dataset.next; if(!next) return;
    e.preventDefault();
    const sel = link.dataset.sound; if(sel){ const a = document.querySelector(sel); a && a.play?.().catch(()=>{}); a && (a.volume = 0.25); }
    body.classList.add('page-exit');
    gsap.to(cover, {autoAlpha:1, duration:0.45, ease:'power2.in', onComplete(){ window.location.href = next; }});
  });

  // ---------- Index page ----------
  function gsapIntro(){
    const typed = document.getElementById('typed');
    if(typed){ gsap.fromTo(typed, {text:''}, {text:typed.textContent, duration:2.4, ease:'none', delay:.2}); }
  }

  // ---------- Cake page (mic blow + tap flames) ----------
  function gsapCake(){
    const flames = document.querySelectorAll('.flame');
    const toCelebrate = document.getElementById('toCelebrate');
    const micToggle = document.getElementById('micToggle');
    let blown = 0, mic = {active:false, stream:null, ctx:null, analyser:null, buf:null};

    gsap.from('.cake', {rotationX:12, y:10, autoAlpha:0, transformOrigin:'50% 100%', duration:0.8, ease:'power3.out'});
    gsap.to('.flame', {keyframes:[{scale:1.05, duration:.1},{scale:1, duration:.1}], repeat:-1, yoyo:true, ease:'sine.inOut'});

    function check(){
      if(blown>=flames.length){
        toCelebrate.classList.remove('disabled');
        toCelebrate.removeAttribute('aria-disabled');
        gsap.fromTo(toCelebrate, {scale:.96}, {scale:1, duration:.5, ease:'elastic.out(1, .7)'});
      }
    }
    function extinguish(el){ if(!el || el.dataset.out==='1') return; el.dataset.out='1'; blown++; gsap.to(el, {autoAlpha:0, y:-6, scale:.6, duration:.35, ease:'power2.out'}); check(); }

    flames.forEach(f=>{ f.addEventListener('click', ()=>extinguish(f)); f.parentElement.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') extinguish(f); }); });

    micToggle?.addEventListener('click', async ()=>{
      try{
        if(!mic.active){
          mic.stream = await navigator.mediaDevices.getUserMedia({audio:true});
          mic.ctx = new (window.AudioContext||window.webkitAudioContext)();
          const src = mic.ctx.createMediaStreamSource(mic.stream);
          mic.analyser = mic.ctx.createAnalyser(); mic.analyser.fftSize = 2048; mic.buf = new Uint8Array(mic.analyser.fftSize);
          src.connect(mic.analyser); mic.active = true; micToggle.textContent = 'Listening… blow gently 💨';
          listen();
        } else { stopMic(); }
      }catch(e){ micToggle.textContent = 'Mic blocked — tap the flames 💕'; }
    });

    function listen(){
      if(!mic.active) return;
      mic.analyser.getByteTimeDomainData(mic.buf);
      let sum=0; for(let i=0;i<mic.buf.length;i++){ const v=mic.buf[i]-128; sum+=v*v; }
      const rms=Math.sqrt(sum/mic.buf.length);
      if(rms>14){ const next=[...document.querySelectorAll('.flame')].find(el=>el.dataset.out!=='1'); next && extinguish(next); }
      requestAnimationFrame(listen);
    }
    function stopMic(){ mic.active=false; micToggle.textContent='Use Microphone'; mic.stream?.getTracks().forEach(t=>t.stop()); mic.ctx?.close(); }
  }

  // ---------- Celebrate page (confetti + fireworks canvas) ----------
  function gsapCelebrate(){
    const canvas = document.getElementById('fx'); if(!canvas) return; const ctx = canvas.getContext('2d');
    let W,H; const DPR=Math.min(2, devicePixelRatio||1);
    function size(){ W=canvas.width=innerWidth*DPR; H=canvas.height=innerHeight*DPR; canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px'; }
    size(); addEventListener('resize', size);

    const pieces=[], rockets=[], grav=.18*DPR, colors=['#ffd1e8','#ff8bc2','#9c6cff','#ffe27a','#7ae0ff'];
    function confetti(x=W/2,y=H*0.35){ for(let i=0;i<220;i++){ pieces.push({x,y,vx:(Math.random()*6-3)*DPR,vy:(Math.random()*-4-2)*DPR,r:(2+Math.random()*3)*DPR,rot:Math.random()*Math.PI,vr:(Math.random()*.3-.15),c:colors[i%colors.length],life:160+Math.random()*60}); } }
    function rocket(){ const x=(.2+Math.random()*.6)*W, y=H*.92, v=-(6+Math.random()*3)*DPR; rockets.push({x,y,vx:(Math.random()*2-1)*DPR,vy:v,fuse:40+Math.random()*20}); }

    function tick(){
      ctx.clearRect(0,0,W,H);
      // rockets
      for(let i=rockets.length-1;i>=0;i--){ const r=rockets[i]; r.x+=r.vx; r.y+=r.vy; r.vy+=grav*.2; r.fuse--; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(r.x,r.y,2*DPR,0,Math.PI*2); ctx.fill(); if(r.fuse<=0){ for(let j=0;j<120;j++){ const a=Math.random()*Math.PI*2, sp=(2+Math.random()*4)*DPR; pieces.push({x:r.x,y:r.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:(1+Math.random()*2)*DPR,rot:0,vr:0,c:colors[j%colors.length],life:120+Math.random()*60}); } rockets.splice(i,1); } }
      // confetti pieces
      for(let i=pieces.length-1;i>=0;i--){ const p=pieces[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=grav; p.rot+=p.vr; p.life--; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c; ctx.fillRect(-p.r,-p.r,p.r*2,p.r*1.2); ctx.restore(); if(p.y>H+40*DPR || p.life<=0) pieces.splice(i,1);} requestAnimationFrame(tick);
    }
    tick();

    document.getElementById('confettiBtn')?.addEventListener('click',()=>confetti());
    document.getElementById('fireworksBtn')?.addEventListener('click',()=>{ for(let i=0;i<5;i++) setTimeout(rocket, i*320); });
    setInterval(()=> Math.random()<0.55 && rocket(), 2200);
    setInterval(()=> Math.random()<0.45 && confetti(Math.random()*W, H*0.3+Math.random()*H*0.25), 3000);
  }

  // ---------- Memory page (circular slideshow + captions + Dayglow + parallax) ----------
  function gsapMemory(){
    const slides=[...document.querySelectorAll('.slide')]; if(!slides.length) return;
    const cap=document.getElementById('caption');
    const song=document.getElementById('dayglow');
    let i=slides.findIndex(s=>s.classList.contains('active'));
    const prev=document.getElementById('prev'), next=document.getElementById('next');

    // fade in Dayglow softly; autoplay might require user gesture depending on browser
    if(song){ song.volume=0; song.play?.().catch(()=>{}); gsap.to(song,{volume:0.25,duration:5}); }

    function show(n){
      const cur=slides[i]; const nxt=slides[n]; if(cur===nxt) return;
      gsap.to(cur, {autoAlpha:0, duration:.8, ease:'power2.out'});
      i=n; nxt.classList.add('active');
      gsap.fromTo(nxt, {autoAlpha:0, scale:1.02}, {autoAlpha:1, scale:1, duration:.8, ease:'power2.out'});
      cur.classList.remove('active');
      cap.textContent=nxt.dataset.caption||'';
    }
    prev?.addEventListener('click', ()=>show((i-1+slides.length)%slides.length));
    next?.addEventListener('click', ()=>show((i+1)%slides.length));
    setInterval(()=>show((i+1)%slides.length), 5200);

    // subtle parallax: move image slightly with mouse
    const host = document.getElementById('slideshow');
    host?.addEventListener('mousemove', (e)=>{
      const r = host.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
      const cy = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(host.querySelectorAll('img'), {x:cx*8, y:cy*6, duration:0.2, ease:'power1.out'});
    });
    host?.addEventListener('mouseleave', ()=> gsap.to(host.querySelectorAll('img'), {x:0, y:0, duration:0.4, ease:'power2.out'}));
  }

  // ---------- Final page (beating heart + heart confetti on hover) ----------
  function gsapFinal(){
    const heart=document.querySelector('.beating-heart'); if(!heart) return;
    gsap.to(heart, {scale:1.06, duration:.6, ease:'power1.inOut', yoyo:true, repeat:-1});

    function heartBurst(x,y){
      for(let i=0;i<18;i++){
        const d=document.createElement('div');
        d.className='heart-trail'; d.textContent='❤️'; d.style.left=x+'px'; d.style.top=y+'px';
        d.style.fontSize=(12+Math.random()*18)+'px'; document.body.appendChild(d);
        gsap.to(d,{x:(Math.random()-0.5)*160, y:(Math.random()-0.5)*160-40, autoAlpha:0, duration:1.6, ease:'power2.out', onComplete:()=>d.remove()});
      }
    }
    heart.addEventListener('mouseenter', e=>heartBurst(e.clientX,e.clientY));
    heart.addEventListener('click', e=>heartBurst(e.clientX,e.clientY));
  }

  // ---------- Special page (starfield + heart constellation with name) ----------
  function gsapStars(){
    const c=document.getElementById('stars'); if(!c) return; const ctx=c.getContext('2d');
    let W,H; const DPR=Math.min(2, devicePixelRatio||1);
    function size(){ W=c.width=innerWidth*DPR; H=c.height=innerHeight*DPR; c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; }
    size(); addEventListener('resize', size);

    // Starfield
    const stars=[]; for(let i=0;i<260;i++){ stars.push({x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.6*DPR, s:Math.random()*0.6+0.2}); }

    // Heart path points (parametric) to connect as constellation
    const heartPts=[]; const cx=W/2, cy=H/2, S=Math.min(W,H)/5;
    for(let t=0;t<Math.PI*2; t+=0.05){
      const x = 16*Math.sin(t)**3;
      const y = 13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
      heartPts.push({x:cx + (x*S/16), y:cy - (y*S/16)});
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      // stars twinkle
      for(const s of stars){ ctx.globalAlpha=0.6+Math.sin((Date.now()*0.002+s.x)*s.s)*0.4; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); }
      ctx.globalAlpha=1;
      // draw heart constellation
      ctx.strokeStyle='rgba(255,180,220,.85)'; ctx.lineWidth=1.2*DPR; ctx.beginPath();
      heartPts.forEach((p,idx)=>{ if(idx===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); });
      ctx.closePath(); ctx.stroke();
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ---------- Kick off ----------
  window.addEventListener('pageshow', enter, {once:true});
})();