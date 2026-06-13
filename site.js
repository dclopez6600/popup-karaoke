window.PUK_GALLERY = [
        { src: "photos/18thstbrewery-1.webp", fallback: "photos/18thstbrewery-1.JPG", caption: "Karaoke Night at 18th Street Brewery", category: "bar", w: 1080, h: 810 },
        { src: "photos/18thstbrewery-2.webp", fallback: "photos/18thstbrewery-2.JPG", caption: "Karaoke Night at 18th Street Brewery", category: "bar", w: 1080, h: 810 },
        { src: "photos/18thstbrewery-4.webp", fallback: "photos/18thstbrewery-4.jpg", caption: "Karaoke Night at 18th Street Brewery", category: "bar", w: 1080, h: 810 },
        { src: "photos/18thstbrewery-6.webp", fallback: "photos/18thstbrewery-6.jpg", caption: "Karaoke Night at 18th Street Brewery", category: "bar", w: 1080, h: 810 },
        { src: "photos/corporate-event-1.webp", fallback: "photos/corporate-event-1.jpg", caption: "Corporate Team Event", category: "corporate", w: 1080, h: 810 },
        { src: "photos/corporate-event-2.webp", fallback: "photos/corporate-event-2.jpg", caption: "Corporate Team Event", category: "corporate", w: 1080, h: 810 },
        { src: "photos/moods-1.webp", fallback: "photos/moods-1.jpg", caption: "Sing Along Brunch at Moods", category: "bar", w: 1080, h: 810 },
        { src: "photos/moods-2.webp", fallback: "photos/moods-2.jpg", caption: "Sing Along Brunch at Moods", category: "bar", w: 1080, h: 810 },
        { type: "cta", category: "wedding", emoji: "💒", label: "Weddings", text: "Be the couple everyone talks about. Every guest on the mic — memories that actually last.", cta: "Book Your Wedding →" },
        { type: "cta", category: "birthday", emoji: "🎂", label: "Birthdays", text: "The birthday upgrade nobody forgets. Your songs, your night, your spotlight.", cta: "Book a Birthday →" }
      ];

(function(){
  var grid=document.getElementById('galleryGrid');
  var section=document.getElementById('gallery');
  var all=window.PUK_GALLERY||[];
  if(!all.length){if(section)section.style.display='none';return;}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  var catLabels={bar:'Bar & Venue',corporate:'Corporate',wedding:'Wedding',birthday:'Birthday'};
  // Only photo items go into lightbox
  var photos=all.filter(function(p){return p.src;});

  function buildGrid(filter){
    var photoIdx=0;
    var html=all.map(function(p){
      var cat=p.category||'all';
      var visible=!filter||filter==='all'||cat===filter;
      if(p.type==='cta'){
        if(!visible)return'';
        return'<a href="#contact" class="gallery-item gallery-cta" data-cat="'+esc(cat)+'">'
          +'<div class="gallery-cta-inner">'
          +'<span class="gallery-cta-emoji">'+esc(p.emoji||'🎤')+'</span>'
          +'<span class="gallery-cta-label">'+esc(p.label||'')+'</span>'
          +'<p class="gallery-cta-text">'+esc(p.text||'')+'</p>'
          +'<span class="gallery-cta-btn">'+esc(p.cta||'Book Now →')+'</span>'
          +'</div>'
          +'</a>';
      }
      var idx=photoIdx++;
      var wAttr=p.w?' width="'+p.w+'" height="'+p.h+'"':'';
      var imgTag=p.fallback
        ?'<picture><source srcset="'+esc(p.src)+'" type="image/webp"><img src="'+esc(p.fallback)+'" alt="'+esc(p.caption||'Event photo')+'" loading="lazy" decoding="async"'+wAttr+'></picture>'
        :'<img src="'+esc(p.src)+'" alt="'+esc(p.caption||'Event photo')+'" loading="lazy" decoding="async"'+wAttr+'>';
      var catTag=catLabels[cat]?'<span class="gallery-cat-tag">'+esc(catLabels[cat])+'</span>':'';
      return'<button class="gallery-item'+(visible?'':' gallery-hidden')+'" type="button" data-i="'+idx+'" data-cat="'+esc(cat)+'" aria-label="'+esc(p.caption||'Event photo')+'">'
        +imgTag+catTag
        +(p.caption?'<span class="caption">'+esc(p.caption)+'</span>':'')
        +'</button>';
    }).join('');
    grid.innerHTML=html;
  }

  buildGrid('all');

  // Filter tabs
  document.querySelectorAll('.gallery-filter-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.gallery-filter-btn').forEach(function(b){b.classList.remove('active');});
      this.classList.add('active');
      buildGrid(this.dataset.filter);
    });
  });

  // Lightbox
  var lb=document.getElementById('lightbox');
  var lbImg=document.getElementById('lightboxImg');
  var lbCap=document.getElementById('lightboxCaption');
  var current=0;
  function open(i){
    current=(i+photos.length)%photos.length;
    lbImg.src=photos[current].src||photos[current].fallback;
    lbImg.alt=photos[current].caption||'Event photo';
    lbCap.textContent=photos[current].caption||'';
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function close(){lb.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  grid.addEventListener('click',function(e){
    var btn=e.target.closest('.gallery-item[data-i]');
    if(btn)open(parseInt(btn.dataset.i,10));
  });
  lb.querySelector('.lightbox-close').addEventListener('click',close);
  lb.querySelector('.lightbox-prev').addEventListener('click',function(){open(current-1);});
  lb.querySelector('.lightbox-next').addEventListener('click',function(){open(current+1);});
  lb.addEventListener('click',function(e){if(e.target===lb)close();});
  document.addEventListener('keydown',function(e){
    if(lb.getAttribute('aria-hidden')==='true')return;
    if(e.key==='Escape')close();
    else if(e.key==='ArrowLeft')open(current-1);
    else if(e.key==='ArrowRight')open(current+1);
  });
  var touchStartX=0;
  lb.addEventListener('touchstart',function(e){touchStartX=e.changedTouches[0].clientX;},{passive:true});
  lb.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-touchStartX;
    if(Math.abs(dx)>40){if(dx<0)open(current+1);else open(current-1);}
  },{passive:true});
})();

window.PUK_CALENDAR = {
            funFact: "According to recent studies, singing karaoke relieves stress, boosts self-esteem and confidence, and builds social connections — all major life extenders.",
            months: [
              {
                month: "June 2026",
                events: [
                  { date: 10, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 12, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 16, day: "Tuesday",   venue: "Flights Taproom",     venueUrl: "/flights-taproom-karaoke.html",     venueClass: "flights",           time: "8pm – 11pm", address: "839 169th St, Hammond, IN", mapsQuery: "Flights Taproom 839 169th St Hammond IN" },
                  { date: 17, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 19, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 24, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 26, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" }
                ]
              },
              {
                month: "July 2026",
                events: [
                  { date: 1,  day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 3,  day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 7,  day: "Tuesday",   venue: "Flights Taproom",     venueUrl: "/flights-taproom-karaoke.html",     venueClass: "flights",           time: "8pm – 11pm", address: "839 169th St, Hammond, IN", mapsQuery: "Flights Taproom 839 169th St Hammond IN" },
                  { date: 8,  day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 10, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 15, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 17, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 21, day: "Tuesday",   venue: "Flights Taproom",     venueUrl: "/flights-taproom-karaoke.html",     venueClass: "flights",           time: "8pm – 11pm", address: "839 169th St, Hammond, IN", mapsQuery: "Flights Taproom 839 169th St Hammond IN" },
                  { date: 22, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 24, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 29, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 31, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" }
                ]
              },
              {
                month: "August 2026",
                events: [
                  { date: 4,  day: "Tuesday",   venue: "Flights Taproom",     venueUrl: "/flights-taproom-karaoke.html",     venueClass: "flights",           time: "8pm – 11pm", address: "839 169th St, Hammond, IN", mapsQuery: "Flights Taproom 839 169th St Hammond IN" },
                  { date: 5,  day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 7,  day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 12, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 14, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 18, day: "Tuesday",   venue: "Flights Taproom",     venueUrl: "/flights-taproom-karaoke.html",     venueClass: "flights",           time: "8pm – 11pm", address: "839 169th St, Hammond, IN", mapsQuery: "Flights Taproom 839 169th St Hammond IN" },
                  { date: 19, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 21, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 26, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 28, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" }
                ]
              },
              {
                month: "September 2026",
                events: [
                  { date: 1,  day: "Tuesday",   venue: "Flights Taproom",     venueUrl: "/flights-taproom-karaoke.html",     venueClass: "flights",           time: "8pm – 11pm", address: "839 169th St, Hammond, IN", mapsQuery: "Flights Taproom 839 169th St Hammond IN" },
                  { date: 2,  day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 4,  day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 9,  day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 11, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 15, day: "Tuesday",   venue: "Flights Taproom",     venueUrl: "/flights-taproom-karaoke.html",     venueClass: "flights",           time: "8pm – 11pm", address: "839 169th St, Hammond, IN", mapsQuery: "Flights Taproom 839 169th St Hammond IN" },
                  { date: 16, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 18, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 23, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" },
                  { date: 25, day: "Friday",    venue: "El Capitán",          venueUrl: "/el-capitan-karaoke.html",          venueClass: "elCapitan",         time: "8pm – 12am", address: "327 Main St, Hobart, IN",   mapsQuery: "El Capitan 327 Main St Hobart IN" },
                  { date: 30, day: "Wednesday", venue: "18th Street Brewery", venueUrl: "/18th-street-brewery-karaoke.html", venueClass: "18thStreetBrewery", time: "7pm – 10pm", address: "5725 Miller Ave, Gary, IN", mapsQuery: "18th Street Brewery 5725 Miller Ave Gary IN" }
                ]
              }
            ]
          };

(function(){
          var d=window.PUK_CALENDAR;if(!d||!d.months)return;
          var listEl=document.getElementById('cal-events');
          var factEl=document.querySelector('.cal-funfact-text');
          if(factEl&&d.funFact)factEl.textContent=d.funFact;
          if(!listEl)return;
          var today=new Date();today.setHours(0,0,0,0);
          var dayShort={Sunday:'SUN',Monday:'MON',Tuesday:'TUE',Wednesday:'WED',Thursday:'THU',Friday:'FRI',Saturday:'SAT'};
          function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
          var monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
          var html='';
          d.months.forEach(function(m){
            var future=m.events.filter(function(e){
              var parts=m.month.split(' ');
              var mo=monthNames.indexOf(parts[0]);
              var yr=parseInt(parts[1]);
              var evDate=new Date(yr,mo,e.date);
              return evDate>=today;
            });
            if(!future.length)return;
            html+='<h4 class="cal-month-group">'+esc(m.month)+'</h4>';
            html+=future.map(function(e){
              var parts=m.month.split(' ');
              var mo=monthNames.indexOf(parts[0]);
              var yr=parseInt(parts[1]);
              var qs=encodeURIComponent(e.mapsQuery||(e.venue+' '+e.address));
              var maps='https://www.google.com/maps/search/?api=1&query='+qs;
              var venueCls=(e.venueClass||'').replace(/[^A-Za-z0-9]/g,'');
              var dayCode=dayShort[e.day]||(e.day||'').slice(0,3).toUpperCase();
              var vLink=e.venueUrl?'<a href="'+esc(e.venueUrl)+'">'+esc(e.venue)+'</a>':esc(e.venue);
              return '<article class="cal-event venue-'+venueCls+'">'
                +'<div class="cal-event-date">'
                +'<span class="cal-event-day">'+dayCode+'</span>'
                +'<span class="cal-event-num">'+esc(e.date)+'</span>'
                +'</div>'
                +'<div class="cal-event-info">'
                +'<h4 class="cal-event-venue">'+vLink+'</h4>'
                +'<div class="cal-event-meta">'
                +'<span class="cal-event-time">'+esc(e.time)+'</span>'
                +'<span class="cal-event-addr"><a href="'+maps+'" target="_blank" rel="noopener">'+esc(e.address)+'</a></span>'
                +'</div>'
                +'</div>'
                +'</article>';
            }).join('');
          });
          listEl.innerHTML=html||'<p class="cal-empty">No upcoming public events — check back soon!</p>';
        })();

(function(){
          function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

          fetch('/karafun-data.json')
            .then(function(r){return r.json();})
            .then(function(data){
              // Top US
              if(data.top_us&&data.top_us.length){
                var el=document.getElementById('topUsList');
                if(el) el.innerHTML=data.top_us.map(function(s,i){
                  return '<li class="song"><span class="song-rank">'+(i+1)+'</span>'
                    +'<div class="song-info"><div class="song-title">'+esc(s.title)+'</div>'
                    +'<div class="song-artist">'+esc(s.artist)+'</div></div></li>';
                }).join('');
              }
              // Latest Additions
              if(data.latest&&data.latest.length){
                var el2=document.getElementById('latestList');
                if(el2) el2.innerHTML=data.latest.map(function(s){
                  return '<li class="song"><div class="song-info">'
                    +'<div class="song-title">'+esc(s.title)+'</div>'
                    +'<div class="song-artist">'+esc(s.artist)+'</div>'
                    +'</div><span class="new-tag">NEW</span></li>';
                }).join('');
              }
            }).catch(function(){/* keep static fallback */});
        })();

(function(){
                  var ta=document.getElementById("b-msg");
                  var ct=document.getElementById("b-msg-counter");
                  if(ta&&ct){ta.addEventListener("input",function(){ct.textContent=ta.value.length+" / 1000";});}
                })()

(function(){
    'use strict';
    function animateCounter(el,to,decimals,suffix,duration){
      var start=null;
      function step(ts){
        if(!start)start=ts;
        var p=Math.min((ts-start)/duration,1);
        var ease=1-Math.pow(1-p,4);
        var val=to*ease;
        el.textContent=(decimals>0?val.toFixed(decimals):Math.floor(val))+suffix;
        if(p<1){requestAnimationFrame(step);}
        else{el.textContent=(decimals>0?to.toFixed(decimals):to)+suffix;el.classList.add('count-done');}
      }
      requestAnimationFrame(step);
    }
    var proof=document.querySelector('.proof');
    if(!proof)return;
    var fired=false;
    var io=new IntersectionObserver(function(entries){
      if(fired)return;
      if(entries[0].isIntersecting){
        fired=true;io.disconnect();
        proof.querySelectorAll('[data-count]').forEach(function(el){
          animateCounter(el,parseFloat(el.getAttribute('data-count')),parseInt(el.getAttribute('data-decimals')||'0',10),el.getAttribute('data-suffix')||'',parseInt(el.getAttribute('data-duration')||'2000',10));
        });
      }
    },{threshold:0.5});
    io.observe(proof);
  })();

(function(){
    var dd=document.getElementById('navAreasDd');
    var toggle=dd?dd.querySelector('.nav-dd-toggle'):null;
    if(!dd||!toggle)return;
    function open(){dd.classList.add('open');toggle.setAttribute('aria-expanded','true');}
    function close(){dd.classList.remove('open');toggle.setAttribute('aria-expanded','false');}
    toggle.addEventListener('click',function(e){dd.classList.contains('open')?close():open();e.stopPropagation();});
    document.addEventListener('click',function(e){if(!dd.contains(e.target))close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
    dd.querySelectorAll('.nav-dd-menu a').forEach(function(a){a.addEventListener('click',close);});
  })();

(function(){
    'use strict';
    // NOTE: window.SONGS is set by songs.js at global scope.
    // Do NOT declare a local var SONGS here — that would shadow the global.
    var loading=false,pendingQuery=null;
    var input=document.getElementById('songSearchInput');
    var results=document.getElementById('songSearchResults');
    var clearBtn=document.getElementById('songSearchClear');
    if(!input)return;

    function loadCatalog(){
      if(loading)return;
      loading=true;
      var s=document.createElement('script');
      s.src='songs.js';
      s.onload=function(){
        loading=false;
        if(pendingQuery){var q=pendingQuery;pendingQuery=null;runSearch(q);}
      };
      s.onerror=function(){
        loading=false;
        results.innerHTML='<p style="color:#f87171;font-size:0.9rem;padding:0.5rem 0;">Could not load catalog. Please refresh and try again.</p>';
      };
      document.head.appendChild(s);
    }

    function runSearch(q){
      q=q.trim().toLowerCase();
      if(!q){results.innerHTML='';clearBtn.classList.remove('visible');return;}
      clearBtn.classList.add('visible');
      if(!window.SONGS){
        pendingQuery=q;
        if(!loading)loadCatalog();
        results.innerHTML='<p style="color:var(--text-dim);font-size:0.9rem;padding:0.5rem 0;">Loading catalog…</p>';
        return;
      }
      var all=window.SONGS.filter(function(s){
        return s.t.toLowerCase().indexOf(q)!==-1||s.a.toLowerCase().indexOf(q)!==-1;
      });
      var matches=all.slice(0,8);
      if(matches.length){
        results.innerHTML=matches.map(function(s){
          return '<div class="song-result-item">'
            +'<div><div class="song-result-title">'+s.t+'</div><div class="song-result-artist">'+s.a+'</div></div>'
            +'<span class="song-result-check">✓ In Library</span>'
            +'</div>';
        }).join('')+'<p class="song-search-count">Showing '+matches.length+' of '+all.length+' matches — 75,000+ total songs available</p>';
      } else {
        results.innerHTML='<div class="song-search-not-found"><p>Not in our library preview — but with 75,000+ songs we very likely have it!</p><a href="#contact" class="btn btn-primary" style="font-size:0.85rem;padding:0.5rem 1rem;">Request This Song</a></div>';
      }
    }

    input.addEventListener('input',function(){runSearch(this.value);});
    input.addEventListener('focus',function(){if(!window.SONGS&&!loading)loadCatalog();},{once:true});
    clearBtn.addEventListener('click',function(){input.value='';results.innerHTML='';clearBtn.classList.remove('visible');input.focus();});
  })();

(function(){
    'use strict';
    var answers={};
    var steps=['quizStep1','quizStep2','quizStep3','quizResult'];
    var dots=['qd1','qd2','qd3'];
    var current=0;
    var RESULTS={
      birthday:{emoji:'🎂',title:"Let's Make It Unforgettable",msg:"Birthday parties are our specialty. We'll personalize the setlist, hype up the guest of honor, and keep the energy electric all night. Perfect for any age, any size."},
      wedding:{emoji:'💒',title:"Your Reception Just Got Better",msg:"Karaoke is the surprise your guests will talk about for years. We'll work seamlessly alongside your DJ or band, and make sure every generation gets on the mic."},
      corporate:{emoji:'🏢',title:"Team Bonding Done Right",msg:"Karaoke is hands-down the best icebreaker for corporate events. We handle everything — COI included — so you can focus on your team having a great time."},
      bar:{emoji:'🍺',title:"Turn Slow Nights Into Packed Ones",msg:"We already run weekly residencies at 18th Street Brewery, Flights Taproom, and El Capitán. A karaoke night drives repeat traffic and loyal regulars. Let's talk residency options."},
      party:{emoji:'🎉',title:"Let's Get This Party Started",msg:"Whatever the occasion, we bring the full show — sound, lights, host, and 75,000+ songs. Just tell us the vibe and we'll dial it in perfectly."},
      curious:{emoji:'🎵',title:"Glad You're Here!",msg:"No pressure — just explore. We'd love to show you what a PopUp Karaoke experience looks like. Check out our videos or reach out with any questions."}
    };
    function show(stepId){
      steps.forEach(function(id){
        var el=document.getElementById(id);
        if(el)el.classList.toggle('quiz-hidden',id!==stepId);
      });
      dots.forEach(function(id,i){
        var el=document.getElementById(id);
        if(el)el.classList.toggle('active',i<=current-1);
      });
    }
    function showResult(){
      var r=RESULTS[answers[1]]||RESULTS.curious;
      document.getElementById('quizEmoji').textContent=r.emoji;
      document.getElementById('quizResultTitle').textContent=r.title;
      document.getElementById('quizResultMsg').textContent=r.msg;
      show('quizResult');
    }
    document.querySelectorAll('.quiz-opt').forEach(function(btn){
      btn.addEventListener('click',function(){
        var step=parseInt(this.dataset.step,10);
        answers[step]=this.dataset.val;
        current=step;
        if(step===1){show('quizStep2');dots[0].classList&&document.getElementById('qd1').classList.add('active');}
        else if(step===2){show('quizStep3');document.getElementById('qd2').classList.add('active');}
        else if(step===3){showResult();document.getElementById('qd3').classList.add('active');}
      });
    });
    var restart=document.getElementById('quizRestart');
    if(restart){restart.addEventListener('click',function(){answers={};current=0;show('quizStep1');dots.forEach(function(id){var el=document.getElementById(id);if(el)el.classList.remove('active');});});}
  })();

(function(){
    'use strict';
    var faqSection=document.getElementById('faq');
    if(!faqSection)return;
    faqSection.querySelectorAll('.faq-q').forEach(function(btn){
      btn.addEventListener('click',function(){
        var item=btn.closest('.faq-item');
        var isOpen=item.classList.contains('open');
        faqSection.querySelectorAll('.faq-item.open').forEach(function(i){
          i.classList.remove('open');
          i.querySelector('.faq-q').setAttribute('aria-expanded','false');
        });
        if(!isOpen){
          item.classList.add('open');
          btn.setAttribute('aria-expanded','true');
        }
      });
    });
  })();

(function(){
    'use strict';
    var bar=document.getElementById('stickyBar');
    var hero=document.querySelector('.hero');
    if(!bar)return;
    function check(){
      var threshold=hero?hero.offsetTop+hero.offsetHeight:400;
      if(window.scrollY>threshold){bar.classList.add('visible');bar.setAttribute('aria-hidden','false');}
      else{bar.classList.remove('visible');bar.setAttribute('aria-hidden','true');}
    }
    window.addEventListener('scroll',check,{passive:true});
    check();
    bar.querySelectorAll('a[href="#contact"]').forEach(function(a){
      a.addEventListener('click',function(){bar.classList.remove('visible');});
    });
  })();

// Exit modal handled by the dedicated handler below (lines ~590)

(function(){
    'use strict';
    var btn=document.getElementById('availBtn');
    var dateInput=document.getElementById('availDate');
    var feedback=document.getElementById('availFeedback');
    var feedbackWrap=document.getElementById('availFeedbackWrap');
    var ctaBtn=document.getElementById('availCtaBtn');
    var bookDate=document.getElementById('b-date');
    if(!btn||!dateInput)return;
    var today=new Date();
    var mm=String(today.getMonth()+1).padStart(2,'0');
    var dd=String(today.getDate()).padStart(2,'0');
    var todayStr=today.getFullYear()+'-'+mm+'-'+dd;
    dateInput.min=todayStr;
    dateInput.value=todayStr; // pre-fill with today so users just change if needed
    // Also pre-fill the quick-check strip date input
    var qcDate=document.getElementById('qc-date');
    if(qcDate){qcDate.min=todayStr;qcDate.value=todayStr;}
    // Booked-out dates (update these as needed — format: YYYY-MM-DD)
    var bookedDates=[];
    // Auto-expire past booked dates so they don't block the calendar
    bookedDates=bookedDates.filter(function(d){return d>=todayStr;});
    function isBooked(dateStr){return bookedDates.indexOf(dateStr)!==-1;}
    function checkDate(){
      var val=dateInput.value;
      if(!val){feedback.textContent='Please select a date first.';feedback.className='avail-feedback warn';if(feedbackWrap)feedbackWrap.style.display='block';if(ctaBtn)ctaBtn.style.display='none';return;}
      var d=new Date(val+'T12:00:00');
      var dayOfWeek=d.getDay(); // 0=Sun,6=Sat
      var formatted=d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
      var isWeekend=(dayOfWeek===5||dayOfWeek===6||dayOfWeek===0);
      if(feedbackWrap)feedbackWrap.style.display='block';
      if(isBooked(val)){
        feedback.className='avail-feedback warn';
        feedback.textContent='😔 That date is already booked. Pick another date or give us a call — we may be able to work something out.';
        if(ctaBtn)ctaBtn.style.display='none';
      } else if(isWeekend){
        feedback.className='avail-feedback ok';
        feedback.innerHTML='<strong>🎉 That date looks open!</strong> '+formatted+' is a popular '+(['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayOfWeek])+' — weekend dates fill up fast. Lock it in before someone else does.';
        if(bookDate)bookDate.value=val;
        if(ctaBtn){ctaBtn.style.display='block';}
      } else {
        feedback.className='avail-feedback ok';
        feedback.innerHTML='<strong>✅ That date looks open!</strong> We\'re available '+formatted+'. Fill out the form below to request your event.';
        if(bookDate)bookDate.value=val;
        if(ctaBtn){ctaBtn.style.display='block';}
      }
    }
    btn.addEventListener('click',checkDate);
    dateInput.addEventListener('change',function(){if(dateInput.value)checkDate();});
    if(ctaBtn){
      ctaBtn.addEventListener('click',function(){
        var form=document.getElementById('bookingForm');
        if(form)form.scrollIntoView({behavior:'smooth',block:'center'});
        setTimeout(function(){var nameF=document.getElementById('b-name');if(nameF)nameF.focus();},600);
      });
    }
  })();

(function(){
    var el=document.getElementById('availUrgency');
    if(!el)return;
    var now=new Date();
    var month=now.getMonth();
    var year=now.getFullYear();
    var monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
    // Count remaining Fri/Sat/Sun in current month
    var lastDay=new Date(year,month+1,0).getDate();
    var remaining=0;
    for(var d=now.getDate();d<=lastDay;d++){
      var day=new Date(year,month,d).getDay();
      if(day===5||day===6||day===0)remaining++;
    }
    // Also count next month's to decide messaging
    var nextMonth=(month+1)%12;
    var nextMonthName=monthNames[nextMonth];
    var msg='';
    if(remaining<=4){
      msg='⚡ Only '+remaining+' weekend days left in '+monthNames[month]+'!';
    } else if(remaining<=8){
      msg='📅 '+remaining+' weekend dates still open in '+monthNames[month]+' — check yours now.';
    } else {
      msg='📅 '+nextMonthName+' weekends filling up — lock in your date early.';
    }
    el.textContent=msg;
    el.style.display='block';
    // Also update sticky bar message with same dynamic text
    var stickyMsg=document.querySelector('.sticky-bar-msg');
    if(stickyMsg)stickyMsg.textContent=msg.replace(/^[⚡📅]\s*/,'');
  })();

(function(){
    var inner=document.getElementById('tickerInner');
    if(!inner)return;
    inner.innerHTML+=inner.innerHTML;
  })();

(function(){
    var facade=document.getElementById('highlightFacade');
    var video=document.getElementById('highlightVideo');
    if(!facade||!video)return;
    function playVideo(){
      facade.style.display='none';
      video.src='highlight.mp4';
      video.style.display='block';
      video.play().catch(function(){});
    }
    facade.addEventListener('click',playVideo);
    facade.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();playVideo();}});
    // Autoplay on idle (IntersectionObserver + 3s delay) for desktop
    if('IntersectionObserver' in window&&window.matchMedia('(hover:hover)').matches){
      var timer;
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            timer=setTimeout(playVideo,3000);
          } else {
            clearTimeout(timer);
          }
        });
      },{threshold:0.5});
      io.observe(facade);
    }
  })();

(function(){var btn=document.getElementById('backToTop');if(!btn)return;window.addEventListener('scroll',function(){if(window.scrollY>400){btn.classList.add('visible');}else{btn.classList.remove('visible');}},{passive:true});btn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});})();

(function(){
    var modal = document.getElementById('exitModal');
    var bye   = document.getElementById('byeOverlay');
    var KEY   = 'puk_ei';

    function show(){
      if(sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY,'1');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function showBye(){
      modal.style.display = 'none';
      document.body.style.overflow = '';
      bye.style.opacity = '0';
      bye.style.display = 'flex';
      // reset words
      ['byeWord1','byeWord2','byeWord3','byeSub'].forEach(function(id){
        var el = document.getElementById(id);
        if(el){ el.style.opacity='0'; el.style.transform='translateY(24px)'; }
      });
      document.getElementById('byeNotes').innerHTML = '';
      setTimeout(function(){
        bye.style.opacity = '1';
        ['byeWord1','byeWord2','byeWord3','byeSub'].forEach(function(id,i){
          setTimeout(function(){
            var el = document.getElementById(id);
            if(el){ el.style.opacity='1'; el.style.transform='translateY(0)'; }
          }, i * 680 + 80);
        });
        // musical notes
        var notes = ['♪','♫','♩','♬'];
        var colors = ['#ff2d92','#a855f7','#c084fc','#f472b6','#e879f9'];
        var nb = document.getElementById('byeNotes');
        for(var n=0; n<22; n++){
          (function(i){
            setTimeout(function(){
              var s = document.createElement('span');
              s.textContent = notes[i%4];
              s.style.cssText = 'position:absolute;font-size:'+(1.2+Math.random()*2.2).toFixed(1)+'rem;color:'+colors[Math.floor(Math.random()*5)]+';left:'+(2+Math.random()*96).toFixed(1)+'%;bottom:-3rem;animation:noteFloat '+(1.6+Math.random()*1.8).toFixed(1)+'s ease-out forwards;pointer-events:none;';
              nb.appendChild(s);
            }, i*110);
          })(n);
        }
        setTimeout(function(){ bye.style.opacity='0'; setTimeout(function(){ bye.style.display='none'; },520); }, 4500);
      }, 40);
    }

    // TRIGGER 1: mouse exits toward top (Safari + Chrome)
    document.addEventListener('mouseleave', function(e){
      if(e.clientY < 40) show();
    });
    document.documentElement.addEventListener('mouseleave', function(e){
      if(e.clientY < 40) show();
    });

    // TRIGGER 2: rapid scroll back to top after scrolling down
    var prevY = 0, scrolledFar = false;
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      if(y > 500) scrolledFar = true;
      if(scrolledFar && prevY - y > 300 && y < 100) show();
      prevY = y;
    }, {passive:true});

    // TRIGGER 3: tab hidden on mobile (home button / app switch)
    document.addEventListener('visibilitychange', function(){
      if(document.visibilityState === 'hidden' && scrolledFar) show();
    });

    // TRIGGER 4: guaranteed timer — 40 seconds on page
    setTimeout(show, 40000);

    // BUTTONS
    var bookBtn = document.getElementById('exitBookBtn');
    if(bookBtn) bookBtn.addEventListener('click', function(){
      modal.style.display='none'; document.body.style.overflow='';
    });

    var dismissBtn = document.getElementById('exitDismiss');
    if(dismissBtn) dismissBtn.addEventListener('click', showBye);

    modal.addEventListener('click', function(e){ if(e.target===modal) showBye(); });

    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && modal.style.display==='flex') showBye();
    });
  })();

(function(){
  'use strict';
  var sf = document.getElementById('songForm');
  if(!sf) return;

  sf.addEventListener('submit', function(e){
    e.preventDefault();

    // Let the setupForm validation run first by reading its results
    var invalids = sf.querySelectorAll('.invalid');
    if(invalids.length){ invalids[0].focus(); return; }

    // Re-run validation manually on required fields
    var ok = true;
    sf.querySelectorAll('input[required], textarea[required]').forEach(function(f){
      if(!(f.value||'').trim()){
        f.classList.add('invalid');
        var err = f.parentElement.querySelector('.form-error');
        if(err){ err.textContent='This field is required.'; err.classList.add('show'); }
        if(ok){ f.focus(); ok=false; }
      }
    });
    if(!ok) return;

    var btn = sf.querySelector('button[type="submit"]');
    if(btn){ btn.disabled=true; btn.textContent='Sending…'; }

    var data = new URLSearchParams(new FormData(sf));
    fetch('/', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: data.toString()
    })
    .then(function(){
      sf.innerHTML = '<div style="text-align:center;padding:2rem 0 1rem">'
        + '<div style="font-size:3rem;margin-bottom:0.75rem">🎤</div>'
        + '<h3 style="margin-bottom:0.5rem">Request Sent!</h3>'
        + '<p style="color:var(--text-dim)">We\'ve got your song and will have it ready for you. See you on stage!</p>'
        + '</div>';
    })
    .catch(function(){
      // Netlify fetch failed — fall back to normal POST redirect
      if(btn){ btn.disabled=false; btn.textContent='🎤 Send Song Request'; }
      sf.submit();
    });
  });
})();

(function(){'use strict';var yr=document.getElementById('year');if(yr)yr.textContent=new Date().getFullYear();var nav=document.getElementById('nav');function onScroll(){if(window.scrollY>30)nav.classList.add('scrolled');else nav.classList.remove('scrolled');}window.addEventListener('scroll',onScroll,{passive:true});onScroll();var navToggle=document.getElementById('navToggle');var mobileOverlay=document.getElementById('mobileOverlay');function closeMobileNav(){if(mobileOverlay)mobileOverlay.classList.remove('open');if(navToggle)navToggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');if(mobileOverlay)mobileOverlay.setAttribute('aria-hidden','true');}if(navToggle&&mobileOverlay){navToggle.addEventListener('click',function(){var open=mobileOverlay.classList.toggle('open');navToggle.setAttribute('aria-expanded',open?'true':'false');document.body.classList.toggle('menu-open',open);mobileOverlay.setAttribute('aria-hidden',open?'false':'true');});mobileOverlay.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){closeMobileNav();});});mobileOverlay.addEventListener('click',function(e){if(e.target===mobileOverlay)closeMobileNav();});}document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mobileOverlay&&mobileOverlay.classList.contains('open'))closeMobileNav();});var mobileOverlayClose=document.getElementById('mobileOverlayClose');if(mobileOverlayClose)mobileOverlayClose.addEventListener('click',closeMobileNav);var openers=document.querySelectorAll('[data-open-modal]');var closers=document.querySelectorAll('[data-close-modal]');function openModal(id){var m=document.getElementById(id);if(!m)return;m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';var firstInput=m.querySelector('input, textarea, select, button');if(firstInput)setTimeout(function(){firstInput.focus();},50);}function closeAllModals(){document.querySelectorAll('.modal').forEach(function(m){m.setAttribute('aria-hidden','true');});document.body.style.overflow='';}openers.forEach(function(b){b.addEventListener('click',function(){openModal(b.getAttribute('data-open-modal'));});});closers.forEach(function(b){b.addEventListener('click',closeAllModals);});document.querySelectorAll('.modal').forEach(function(m){m.addEventListener('click',function(e){if(e.target===m)closeAllModals();});});document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAllModals();});if('IntersectionObserver'in window){var io=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('in');io.unobserve(entry.target);}});},{threshold:0.08,rootMargin:'0px 0px 0px 0px'});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});}else{document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');});}try{if(location.search.indexOf('sent=1')!==-1){alert("Thanks! We got your request and will be in touch soon. 🎤");if(history.replaceState)history.replaceState({},'',location.pathname);}}catch(e){}function validateField(field){var msg='';var v=(field.value||'').trim();if(field.required&&!v){msg='This field is required.';}else if(field.type==='email'&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){msg='Please enter a valid email address.';}else if(field.type==='tel'&&v&&v.replace(/\D/g,'').length<7){msg='Please enter a valid phone number.';}else if(field.tagName==='SELECT'&&field.required&&!v){msg='Please select an option.';}var errorEl=field.parentElement.querySelector('.form-error');if(msg){field.classList.add('invalid');field.classList.remove('valid');field.setAttribute('aria-invalid','true');if(errorEl){errorEl.textContent=msg;errorEl.classList.add('show');}return false;}else{field.classList.remove('invalid');if(v)field.classList.add('valid');field.setAttribute('aria-invalid','false');if(errorEl)errorEl.classList.remove('show');return true;}}function setupForm(form){if(!form)return;Array.prototype.forEach.call(form.querySelectorAll('.form-group'),function(g){if(g.querySelector('.form-error'))return;var err=document.createElement('div');err.className='form-error';err.setAttribute('role','alert');g.appendChild(err);});var fields=form.querySelectorAll('input:not([type=hidden]):not([name=_honey]), select, textarea');Array.prototype.forEach.call(fields,function(f){f.addEventListener('blur',function(){validateField(f);});f.addEventListener('input',function(){if(f.classList.contains('invalid'))validateField(f);});});form.addEventListener('submit',function(e){var allValid=true;Array.prototype.forEach.call(fields,function(f){if(!validateField(f))allValid=false;});if(!allValid){e.preventDefault();var firstInvalid=form.querySelector('.invalid');if(firstInvalid)firstInvalid.focus();return;}var btn=form.querySelector('button[type="submit"]');if(btn){btn.classList.add('submitting');btn.dataset.originalText=btn.innerHTML;btn.innerHTML='Sending…';btn.setAttribute('disabled','disabled');}});}// Two-step booking form
(function(){
  var step1=document.getElementById('formStep1');
  var step2=document.getElementById('formStep2');
  var fp1=document.getElementById('fp1');
  var fp2=document.getElementById('fp2');
  var nextBtn=document.getElementById('formNextBtn');
  var backBtn=document.getElementById('formBackBtn');
  if(!step1||!step2||!nextBtn||!backBtn)return;
  function goStep2(){
    // Validate step 1 fields
    var nameF=document.getElementById('b-name');
    var emailF=document.getElementById('b-email');
    var typeF=document.getElementById('b-type');
    var valid=true;
    [nameF,emailF,typeF].forEach(function(f){if(!validateField(f))valid=false;});
    if(!valid)return;
    step1.style.display='none';
    step2.style.display='block';
    if(fp1){fp1.classList.remove('fp-active');fp1.classList.add('fp-done');fp1.querySelector('.fp-num').textContent='✓';}
    if(fp2){fp2.classList.add('fp-active');}
    // Pre-fill date from availability checker if set
    var availDate=document.getElementById('availDate');
    var bookDate=document.getElementById('b-date');
    if(availDate&&bookDate&&availDate.value&&!bookDate.value)bookDate.value=availDate.value;
    step2.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function goStep1(){
    step2.style.display='none';
    step1.style.display='block';
    if(fp1){fp1.classList.add('fp-active');fp1.classList.remove('fp-done');fp1.querySelector('.fp-num').textContent='1';}
    if(fp2){fp2.classList.remove('fp-active');}
    step1.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  nextBtn.addEventListener('click',goStep2);
  backBtn.addEventListener('click',goStep1);
})();
setupForm(document.getElementById('bookingForm'));setupForm(document.getElementById('songForm'));window.dataLayer=window.dataLayer||[];function trackEvent(eventName,fbEvent,params){params=params||{};try{window.dataLayer.push(Object.assign({event:eventName},params));}catch(e){}try{if(typeof window.fbq==='function'){window.fbq('track',fbEvent,params);}}catch(e){}}var bookingForm=document.getElementById('bookingForm');if(bookingForm){bookingForm.addEventListener('submit',function(){trackEvent('lead_submit','Lead',{content_name:'Booking Request',content_category:'booking',value:0,currency:'USD'});});}var songForm=document.getElementById('songForm');if(songForm){songForm.addEventListener('submit',function(){trackEvent('lead_submit','Lead',{content_name:'Song Request',content_category:'song_request',value:0,currency:'USD'});});}Array.prototype.forEach.call(document.querySelectorAll('a[href*="square.link"]'),function(a){a.addEventListener('click',function(){var src='unknown';try{var u=new URL(a.href);src=u.searchParams.get('src')||'unknown';}catch(e){}trackEvent('initiate_checkout','InitiateCheckout',{content_name:'Square Payment',payment_method:'square',link_source:src,currency:'USD'});});});Array.prototype.forEach.call(document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]'),function(a){a.addEventListener('click',function(){var kind=a.getAttribute('href').indexOf('tel:')===0?'phone':'email';trackEvent('contact_click','Contact',{content_name:kind==='phone'?'Call':'Email',contact_method:kind});});});})();