   // ============================================
// DATABASE INITIALIZATION
// ============================================

let currentUserId = 'default-user';

async function initApp() {
  try {
    await db.init();
    console.log('✅ Database ready!');
    await loadAllData();
    refreshAllUI();
    showToast('⚓ Data loaded from database!');
  } catch (error) {
    console.error('❌ Failed to initialize:', error);
    showToast('Error loading data. Please refresh.');
  }
}

async function loadAllData() {
  try {
    window.tasks = await TaskRepository.getAll(currentUserId);
    const gameData = await GamificationRepository.get(currentUserId);
    window.xp = gameData.xp;
    const profile = await ProfileRepository.get(currentUserId);
    window.profile = profile;
    console.log('✅ All data loaded');
  } catch (error) {
    console.error('❌ Error loading data:', error);
  }
}

function refreshAllUI() {
  refreshPlant();
  renderTasks();
  refreshGlance();
  updateProfileUI();
}

// Start app when page loads
document.addEventListener('DOMContentLoaded', initApp);

/* ============ TOAST ============ */
let toastTimer;
function showToast(msg){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2200);
}

/* ============ MOBILE DRAWER ============ */
const sidebar=document.getElementById('sidebar');
const overlay=document.getElementById('sidebarOverlay');
function openDrawer(){ sidebar.classList.add('open'); overlay.classList.add('show'); }
function closeDrawer(){ sidebar.classList.remove('open'); overlay.classList.remove('show'); }

document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const bottomMenuBtn = document.getElementById('bottomMenuBtn');
  if(hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if(bottomMenuBtn) bottomMenuBtn.addEventListener('click', openDrawer);
  if(overlay) overlay.addEventListener('click', closeDrawer);
});

/* ============ NAV ============ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault();
      const target=btn.dataset.target;
      if(!target) return;
      document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll(`.nav-btn[data-target="${target}"]`).forEach(b=>b.classList.add('active'));
      document.querySelectorAll('.content-section').forEach(s=>s.classList.remove('active-view'));
      const sec=document.getElementById(target);
      if(sec) sec.classList.add('active-view');
      closeDrawer();
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });
});

/* Academics dropdown */
document.addEventListener('DOMContentLoaded', () => {
  const acadBtn=document.getElementById('academicsDropdownBtn');
  const acadMenu=document.getElementById('academicsMenu');
  if(acadBtn){
    acadBtn.addEventListener('click', ()=>{
      acadBtn.classList.toggle('open');
      acadMenu.classList.toggle('open');
    });
  }
});

/* ============ THEME ============ */
function toggleTheme(){
  const dark = document.getElementById('mode-checkbox').checked;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  if(dark) spawnFireflies(); else clearFireflies();
}
function spawnFireflies(){
  const box=document.getElementById('fireflies');
  if(!box || box.childElementCount>0) return;
  for(let i=0;i<14;i++){
    const f=document.createElement('div');
    f.className='firefly';
    f.style.left=Math.random()*100+'vw';
    f.style.top=(50+Math.random()*45)+'vh';
    f.style.animationDuration=(6+Math.random()*6)+'s';
    f.style.animationDelay=(Math.random()*5)+'s';
    box.appendChild(f);
  }
}
function clearFireflies(){ 
  const box = document.getElementById('fireflies');
  if(box) box.innerHTML=''; 
}

/* ============ MOBILE LAYOUT PREVIEW TOGGLE ============ */
function toggleMobileMode(){
  const on=document.getElementById('mobile-mode-checkbox').checked;
  document.body.classList.toggle('force-mobile', on);
  showToast(on ? 'Mobile-optimized layout enabled 📱' : 'Mobile-optimized layout disabled');
}

// Helper function to get Tier Name & Emoji based on XP
function getTierInfo(xp) {
  if (xp >= 1000) return { title: 'Dread Admiral', emoji: '👑' };
  if (xp >= 500)  return { title: 'Fleet Captain', emoji: '⚔️' };
  if (xp >= 250)  return { title: 'Cyber Corsair', emoji: '🏴‍☠️' };
  if (xp >= 100)  return { title: 'Worst Generation Supernova', emoji: '⚓' };
  return { title: 'East Blue Rookie', emoji: '🍖' };
}

// ============ PLANT GROWTH WITH DATABASE ============
async function refreshPlant() {
  try {
    // Ensure currentUserId is available
    if (typeof currentUserId === 'undefined' || !currentUserId) {
      console.warn('⚠️ currentUserId is not defined yet.');
      return;
    }

    const gameData = await GamificationRepository.get(currentUserId);
    if (!gameData) return;

    window.xp = gameData.xp || 0;

    // Determine tier based on XP score
    const tierInfo = getTierInfo(window.xp);

    const rankName = document.getElementById('rank-name');
    const profileRank = document.getElementById('profile-rank-tier');
    const rankPoints = document.getElementById('rank-points');
    const sprite = document.getElementById('plant-sprite');

    if (rankName) rankName.textContent = tierInfo.title;
    if (profileRank) profileRank.textContent = tierInfo.title;
    if (rankPoints) rankPoints.textContent = window.xp;

    if (sprite) {
      sprite.textContent = tierInfo.emoji;
      sprite.style.transform = 'scale(1.25)';
      setTimeout(() => (sprite.style.transform = 'scale(1)'), 180);
    }
  } catch (error) {
    console.error('❌ Error refreshing plant:', error);
  }
}

// Manual grow button listener
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('manual-plant-grow-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      try {
        if (typeof currentUserId === 'undefined' || !currentUserId) {
          showToast('User not authenticated');
          return;
        }

        await GamificationRepository.addXP(currentUserId, 5);
        await refreshPlant();
        if (typeof showToast === 'function') {
          showToast('+5 XP · Your power awakened! 🌀');
        }
      } catch (error) {
        console.error('❌ Error powering up:', error);
        if (typeof showToast === 'function') {
          showToast('Error powering up!');
        }
      }
    });
  }

  // Initial call to load data
  refreshPlant();
});


// ============ TASKS WITH DATABASE ============
async function renderTasks() {
  const taskBody = document.getElementById('db-task-table-body');
  const emptyNotice = document.getElementById('tasks-empty-notice');

  if(!taskBody) return;

  try {
    window.tasks = await TaskRepository.getAll(currentUserId);
    taskBody.innerHTML = '';

    if (window.tasks.length === 0) {
      if(emptyNotice) emptyNotice.classList.add('show');
    } else {
      if(emptyNotice) emptyNotice.classList.remove('show');

      window.tasks.forEach(task => {
        const tr = document.createElement('tr');
        if (task.status === 'done') tr.classList.add('task-done-row');

        tr.innerHTML = `
          <td>${task.name}</td>
          <td>${task.subject}</td>
          <td>${task.dueDate}</td>
          <td>
            <span class="status-pill ${task.status === 'done' ? 'status-done' : 'status-pending'}">
              ${task.status === 'done' ? 'Done' : 'Pending'}
            </span>
          </td>
          <td>
            <button class="icon-btn toggle-btn" data-id="${task.id}">
              <i class="fa-solid ${task.status === 'done' ? 'fa-rotate-left' : 'fa-check'}"></i>
            </button>
            <button class="icon-btn del-btn" data-id="${task.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        `;

        tr.querySelector('.toggle-btn').addEventListener('click', async () => {
          try {
            const updated = await TaskRepository.toggleStatus(task.id);
            if (updated.status === 'done') {
              await GamificationRepository.addXP(currentUserId, 10);
              await refreshPlant();
              showToast('Task Smashed! +10 XP💎');
            }
            await renderTasks();
            refreshGlance();
          } catch (error) {
            console.error('❌ Error toggling task:', error);
            showToast('Error updating task');
          }
        });

        tr.querySelector('.del-btn').addEventListener('click', async () => {
          if (confirm('Delete this task?')) {
            try {
              await TaskRepository.delete(task.id);
              await renderTasks();
              refreshGlance();
              showToast('Task deleted');
            } catch (error) {
              console.error('❌ Error deleting task:', error);
              showToast('Error deleting task');
            }
          }
        });

        taskBody.appendChild(tr);
      });
    }
  } catch (error) {
    console.error('❌ Error rendering tasks:', error);
    showToast('Error loading tasks');
  }
}

// ============ TASK FORM ============
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('db-task-form');
  if(form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('db-task-name').value.trim();
      const subject = document.getElementById('db-task-subject').value;
      const dueDate = document.getElementById('db-task-date').value;

      if (!name || !dueDate) {
        showToast('Please fill in all fields');
        return;
      }

      try {
        await TaskRepository.create({
          name: name,
          subject: subject,
          dueDate: dueDate,
          userId: currentUserId
        });

        await renderTasks();
        refreshGlance();
        showToast('Raid target added to the map! 🗺️');
        e.target.reset();
      } catch (error) {
        console.error('❌ Error creating task:', error);
        showToast('Error creating task');
      }
    });
  }
});

/* ============ DASHBOARD GLANCE ============ */
const weekSchedule = {
  1:[{time:'07:30 - 09:30',subj:'Introduction to Philosophy'},{time:'09:45 - 11:45',subj:'Practical Research 2'},{time:'12:30 - 02:30',subj:'ICT Programming'},{time:'02:30 - 04:30',subj:'Physical Science'}],
  2:[{time:'07:30 - 09:30',subj:'Introduction to Philosophy'},{time:'09:45 - 11:45',subj:'Contemporary Philippine Arts'},{time:'12:30 - 02:30',subj:'Contemporary Philippine Arts'},{time:'02:30 - 04:30',subj:'Physical Science'}],
  3:[{time:'07:30 - 09:30',subj:'Introduction to Philosophy'},{time:'09:45 - 11:45',subj:'Practical Research 2'},{time:'12:30 - 02:30',subj:'ICT Programming'},{time:'02:30 - 04:30',subj:'Physical Science'}],
  4:[{time:'07:30 - 09:30',subj:'Contemporary Philippine Arts'},{time:'09:45 - 11:45',subj:'Practical Research 2'},{time:'12:30 - 02:30',subj:'Physical Science'},{time:'02:30 - 04:30',subj:'ICT Programming'}],
  5:[{time:'07:30 - 09:30',subj:'Introduction to Philosophy'},{time:'09:45 - 11:45',subj:'Practical Research 2'},{time:'12:30 - 02:30',subj:'ICT Programming'},{time:'02:30 - 04:30',subj:'Contemporary Philippine Arts'}],
};

function refreshGlance(){
  const day = new Date().getDay();
  const todayClasses = weekSchedule[day];
  const classEl=document.getElementById('glance-class');
  if(classEl){
    if(todayClasses){ classEl.textContent = `${todayClasses[0].subj} · ${todayClasses[0].time}`; }
    else { classEl.textContent = 'No classes today — enjoy your break!'; }
  }

  const taskEl=document.getElementById('glance-task');
  if(taskEl){
    const pending = window.tasks ? window.tasks.filter(t=>t.status !== 'done').sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)) : [];
    if(pending.length===0){ taskEl.textContent='No tasks yet'; }
    else{ taskEl.textContent = `${pending[0].name} · due ${pending[0].dueDate}`; }
  }
}

/* ============ STICKY NOTES ============ */
document.addEventListener('DOMContentLoaded', () => {
  const stickyBoard=document.getElementById('sticky-board');
  const notesEmpty=document.getElementById('notes-empty');
  const addNoteBtn=document.getElementById('add-note-btn');
  const noteColors=['#FFE1EF','#E2F6FF','#E1FBF0','#F0E6FF','#FFF3CE'];

  if(!addNoteBtn || !stickyBoard) return;

  addNoteBtn.addEventListener('click', ()=>{
    if(notesEmpty) notesEmpty.style.display='none';
    const color=noteColors[Math.floor(Math.random()*noteColors.length)];
    const rot=(Math.random()*6-3).toFixed(1);
    const note=document.createElement('div');
    note.className='sticky-note';
    note.style.background=color;
    note.style.transform=`rotate(${rot}deg)`;
    note.innerHTML=`<textarea placeholder="Write a reminder..."></textarea><button class="note-del" title="Remove"><i class="fa-solid fa-trash"></i></button>`;
    note.querySelector('.note-del').addEventListener('click', ()=>{
      note.remove();
      if(stickyBoard.querySelectorAll('.sticky-note').length===0 && notesEmpty) {
        notesEmpty.style.display='block';
      }
    });
    stickyBoard.appendChild(note);
  });
});

/* ============ RELAX ARCADE ============ */

/* ============ RELAX ARCADE SYSTEM & TIMER ============ */

// 1. TIMER CONSTANTS & STATE VARIABLES
const ALLOWED_PLAY_TIME = 5 * 60; // 5 minutes in seconds
const COOLDOWN_TIME = 15 * 60;    // 15 minutes cooldown in seconds

let sessionState = 'IDLE'; // 'IDLE', 'PLAYING', or 'LOCKED'
let timeRemaining = ALLOWED_PLAY_TIME;
let arcadeTimerInterval = null;

// Helper to reliably grab timer DOM elements
function getTimerElements() {
  return {
    timerCard: document.getElementById('timerCard'),
    timerDisplay: document.getElementById('timerDisplay'),
    cooldownDisplay: document.getElementById('cooldownDisplay'),
    timerTitle: document.getElementById('timerStatusTitle'),
    timerDesc: document.getElementById('timerStatusDesc'),
    lockOverlay: document.getElementById('lockOverlay')
  };
}

// Format seconds into MM:SS
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// 2. MAIN TIMER LOGIC
function startArcadeTimer() {
  if (sessionState !== 'IDLE') return; // Only trigger from idle start
  
  sessionState = 'PLAYING';
  timeRemaining = ALLOWED_PLAY_TIME;
  updateUI();

  clearInterval(arcadeTimerInterval);
  arcadeTimerInterval = setInterval(() => {
    if (sessionState === 'PLAYING') {
      timeRemaining--;
      if (timeRemaining <= 0) {
        // Lock out after 5 minutes
        sessionState = 'LOCKED';
        timeRemaining = COOLDOWN_TIME;
        showToast('🔒 Playtime limit reached! Time for a study break.');
      }
    } else if (sessionState === 'LOCKED') {
      timeRemaining--;
      if (timeRemaining <= 0) {
        // Cooldown finished
        sessionState = 'IDLE';
        timeRemaining = ALLOWED_PLAY_TIME;
        clearInterval(arcadeTimerInterval);
        showToast('🔓 Games are unlocked! Enjoy your break.');
      }
    }
    updateUI();
  }, 1000);
}

// Trigger check called whenever any game action occurs
function handleGameActivity() {
  if (sessionState === 'IDLE') {
    startArcadeTimer();
  }
}

// 3. UI UPDATER
function updateUI() {
  const { timerCard, timerDisplay, cooldownDisplay, timerTitle, timerDesc, lockOverlay } = getTimerElements();

  if (sessionState === 'IDLE') {
    if (lockOverlay) lockOverlay.classList.add('hidden');
    if (timerCard) timerCard.classList.remove('cooldown');
    if (timerTitle) timerTitle.textContent = "Playtime Remaining:";
    if (timerDesc) timerDesc.textContent = "Starts on your first click";
    if (timerDisplay) timerDisplay.textContent = formatTime(ALLOWED_PLAY_TIME);
  }
  else if (sessionState === 'PLAYING') {
    if (lockOverlay) lockOverlay.classList.add('hidden');
    if (timerCard) timerCard.classList.remove('cooldown');
    if (timerTitle) timerTitle.textContent = "Playtime Remaining:";
    if (timerDesc) timerDesc.textContent = "Session active";
    if (timerDisplay) timerDisplay.textContent = formatTime(timeRemaining);
  } 
  else if (sessionState === 'LOCKED') {
    if (lockOverlay) lockOverlay.classList.remove('hidden');
    if (timerCard) timerCard.classList.add('cooldown');
    if (timerTitle) timerTitle.textContent = "Rest Period Active:";
    if (timerDesc) timerDesc.textContent = "Games temporarily locked";
    if (timerDisplay) timerDisplay.textContent = formatTime(timeRemaining);
    if (cooldownDisplay) cooldownDisplay.textContent = formatTime(timeRemaining);
  }
}

// Game switcher
function switchRelaxGame(idx){
  document.querySelectorAll('.tab-btn').forEach((b,i)=>b.classList.toggle('active', i===idx));
  document.querySelectorAll('.relax-game-panel').forEach((p,i)=>p.classList.toggle('active-panel', i===idx));
  if(idx===1) setupZen();
  if(idx===2) setupRipples();
  if(idx===3) setupCatcher();
  if(idx===4) setupBlossom();
}

/* --- Bubble Popper --- */
const bubbleColors=['#FFB3C6','#AEE2FF','#BEEFC7','#D6C6FF','#FFE49E'];
function resetBubbles(){
  const grid=document.getElementById('bubbleGrid');
  if(!grid) return;
  grid.innerHTML='';
  for(let i=0;i<50;i++){
    const b=document.createElement('button');
    b.className='bubble';
    b.style.background=bubbleColors[i%bubbleColors.length];
    b.addEventListener('click', ()=>{ 
      handleGameActivity(); // Start timer on click
      b.classList.add('popped'); 
    });
    grid.appendChild(b);
  }
}

/* --- Zen Garden --- */
let zenCtx, zenDrawing=false, zenReady=false;
function setupZen(){
  const canvas=document.getElementById('zenCanvas');
  if(!canvas) return;
  if(!zenReady){
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    zenCtx=canvas.getContext('2d');
    zenCtx.strokeStyle='rgba(122,51,88,.35)';
    zenCtx.lineWidth=6; 
    zenCtx.lineCap='round';

    canvas.addEventListener('pointerdown', e=>{ 
      handleGameActivity(); // Start timer on sand draw
      zenDrawing=true; 
      zenCtx.beginPath(); 
      const rect = canvas.getBoundingClientRect();
      zenCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top); 
    });
    canvas.addEventListener('pointermove', e=>{ 
      if(zenDrawing){ 
        const rect = canvas.getBoundingClientRect();
        zenCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top); 
        zenCtx.stroke(); 
      } 
    });
    canvas.addEventListener('pointerup', ()=>zenDrawing=false);
    canvas.addEventListener('pointerleave', ()=>zenDrawing=false);
    zenReady=true;
  }
}
function clearSand(){ 
  if(zenCtx){ 
    zenCtx.clearRect(0,0,zenCtx.canvas.width,zenCtx.canvas.height); 
  } 
}

/* --- Musical Ripples --- */
let rippleCtx, rippleReady=false, audioCtx;
const pentatonic=[261.6,293.7,329.6,392.0,440.0,523.3];
let ripples=[];

function setupRipples(){
  const canvas=document.getElementById('rippleCanvas');
  if(!canvas) return;
  if(!rippleReady){
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    rippleCtx=canvas.getContext('2d');

    canvas.addEventListener('click', e=>{
      handleGameActivity(); // Start timer on ripple creation
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spawnRipple(x, y);
      playNote(pentatonic[Math.floor(Math.random()*pentatonic.length)]);
    });
    rippleReady=true;
    animateRipples();
  }
}

function spawnRipple(x,y){ ripples.push({x,y,r:2,alpha:0.6}); }

function animateRipples(){
  if(rippleCtx){
    rippleCtx.clearRect(0,0,rippleCtx.canvas.width,rippleCtx.canvas.height);
    ripples.forEach(r=>{
      rippleCtx.beginPath();
      rippleCtx.arc(r.x,r.y,r.r,0,Math.PI*2);
      rippleCtx.strokeStyle=`rgba(63,193,255,${r.alpha})`;
      rippleCtx.lineWidth=3;
      rippleCtx.stroke();
      r.r+=2.2; 
      r.alpha-=0.012;
    });
    ripples=ripples.filter(r=>r.alpha>0);
  }
  requestAnimationFrame(animateRipples);
}

function playNote(freq){
  try{
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc=audioCtx.createOscillator();
    const gain=audioCtx.createGain();
    osc.type='sine'; 
    osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+1.1);
    osc.connect(gain); 
    gain.connect(audioCtx.destination);
    osc.start(); 
    osc.stop(audioCtx.currentTime+1.1);
  }catch(err){ 
    console.log('Audio not available:', err);
  }
}

/* --- Fruit Catcher Game --- */
let catcherCtx, catcherReady = false, catcherRunning = false, catcherSpawnTimer = null;
let stars = [], catcherScore = 0;

function setupCatcher() {
  const canvas = document.getElementById('catcherCanvas');
  if (!canvas) return;

  if (!catcherReady) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    catcherCtx = canvas.getContext('2d');

    canvas.addEventListener('click', e => {
      handleGameActivity(); // Start timer on fruit click
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        const dx = clickX - s.x;
        const dy = clickY - s.y;

        if (Math.sqrt(dx * dx + dy * dy) < s.size + 15) {
          stars.splice(i, 1);
          catcherScore++;

          const scoreEl = document.getElementById('catcher-score');
          if (scoreEl) scoreEl.textContent = catcherScore;

          if (catcherScore % 10 === 0) { 
            GamificationRepository.addXP(currentUserId, 5).then(() => {
              refreshPlant();
              showToast('+5 XP · fruity streak! 🍇');
            }).catch(err => console.error('Error:', err));
          }
          break;
        }
      }
    });

    catcherReady = true;
  }

  catcherRunning = true;
  if (!catcherSpawnTimer) {
    const FRUITS = ['🍎', '🍌', '🍋', '🍐', '🍊'];

    catcherSpawnTimer = setInterval(() => {
      if (!catcherRunning || !catcherCtx) return;

      const randomIcon = FRUITS[Math.floor(Math.random() * FRUITS.length)];

      stars.push({
        x: Math.random() * (catcherCtx.canvas.width - 40) + 20,
        y: -10, 
        size: 12 + Math.random() * 8, 
        speed: 0.6 + Math.random() * 1.2,
        icon: randomIcon
      });
    }, 900);
  }

  if (!window.catcherAnimating) {
    window.catcherAnimating = true;
    animateCatcher();
  }
}

function animateCatcher() {
  const isActive = document.getElementById('r-game-3')?.classList.contains('active-panel');

  if (catcherCtx && isActive) {
    catcherRunning = true;
    catcherCtx.clearRect(0, 0, catcherCtx.canvas.width, catcherCtx.canvas.height);

    stars.forEach(s => {
      s.y += s.speed;
      catcherCtx.font = (s.size * 2) + 'px sans-serif';
      catcherCtx.textAlign = 'center'; 
      catcherCtx.textBaseline = 'middle';
      catcherCtx.fillText(s.icon || '🍎', s.x, s.y); 
    });

    stars = stars.filter(s => s.y < catcherCtx.canvas.height + 20);
  } else {
    catcherRunning = false;
  }

  requestAnimationFrame(animateCatcher);
}

/* --- Memory Blossom / Pirate Match --- */
let blossomReady=false;
const blossomEmojis=['MAP','SHIP','ANCHOR','MONEY','PIRATE','SWORD','WAVE','APPLE'];
let blossomState={flipped:[], matched:[], lock:false};

function setupBlossom(){
  blossomReady=true;
  blossomState={flipped:[], matched:[], lock:false};
  const statusEl = document.getElementById('blossomStatus');
  if (statusEl) statusEl.textContent='Find every matching pair ⚓';

  const deck=['🗺️','🚢','⚓','💰','🏴‍☠️','🗡️','🌊','🍎','🗺️','🚢','⚓','💰','🏴‍☠️','🗡️','🌊','🍎'].sort(()=>Math.random()-0.5);
  const grid=document.getElementById('blossomGrid');
  if(!grid) return;
  grid.innerHTML='';
  deck.forEach((emoji,i)=>{
    const card=document.createElement('button');
    card.className='blossom-card';
    card.dataset.emoji=emoji;
    card.dataset.index=i;
    card.textContent='❔';
    card.addEventListener('click', ()=>flipBlossom(card));
    grid.appendChild(card);
  });
}

function flipBlossom(card){
  if(blossomState.lock) return;
  if(card.classList.contains('flipped')||card.classList.contains('matched')) return;

  handleGameActivity(); // Start timer on card flip

  card.classList.add('flipped');
  card.textContent=card.dataset.emoji;
  blossomState.flipped.push(card);

  if(blossomState.flipped.length===2){
    blossomState.lock=true;
    const [a,b]=blossomState.flipped;

    if(a.dataset.emoji===b.dataset.emoji){
      setTimeout(() => {
        a.classList.add('matched');
        b.classList.add('matched');
        blossomState.matched.push(a,b);
        blossomState.flipped=[];
        blossomState.lock=false;

        if(blossomState.matched.length===16){
          const statusEl = document.getElementById('blossomStatus');
          if (statusEl) statusEl.textContent='All blossoms matched! +20 XP 🎉';
          GamificationRepository.addXP(currentUserId, 20).then(() => {
            refreshPlant();
            showToast('Memory Match cleared! 🏴‍☠️');
          }).catch(err => console.error('Error:', err));
        }
      }, 300);
    } else {
      setTimeout(()=>{
        a.classList.remove('flipped');
        a.textContent='❔';
        b.classList.remove('flipped');
        b.textContent='❔';
        blossomState.flipped=[];
        blossomState.lock=false;
      },700);
    }
  }
}

// Auto-initialize default game grid on script load
document.addEventListener('DOMContentLoaded', () => {
  resetBubbles();
});




// ============ PROFILE WITH DATABASE ============
const avatarSeeds = ['taskahead', 'cyber', 'pixel', 'coder', 'gamer', 'sparkle', 'bot', 'fairy', 'garden', 'future'];

async function updateProfileUI() {
  try {
    const profile = await ProfileRepository.get(currentUserId);
    window.profile = profile;

    const nameEl = document.getElementById('profile-display-name');
    const avatarImg = document.getElementById('profile-avatar-img');
    const trackSelect = document.getElementById('profile-sub-track');
    const bioEl = document.getElementById('profile-bio');
    const badgeEl = document.getElementById('track-badge');

    if (nameEl) nameEl.textContent = profile.displayName || 'ICT_Student_User';
    if (avatarImg) avatarImg.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.avatarSeed}`;
    if (trackSelect) trackSelect.value = profile.track || 'General ICT';
    if (bioEl) bioEl.value = profile.bio || '';
    if (badgeEl) badgeEl.textContent = `${profile.track || 'General ICT'} Specialist`;

    console.log('✅ Profile UI updated');
  } catch (error) {
    console.error('❌ Error updating profile UI:', error);
  }
}

async function cycleAvatar() {
  try {
    const profile = await ProfileRepository.get(currentUserId);
    const currentIndex = avatarSeeds.indexOf(profile.avatarSeed);
    const nextIndex = (currentIndex + 1) % avatarSeeds.length;
    const newSeed = avatarSeeds[nextIndex];

    await ProfileRepository.update(currentUserId, {
      displayName: profile.displayName,
      avatarSeed: newSeed,
      track: profile.track,
      bio: profile.bio
    });

    await updateProfileUI();
    showToast(`Avatar changed to: ${newSeed} 🤖`);
  } catch (error) {
    console.error('❌ Error updating avatar:', error);
    showToast('Error updating avatar');
  }
}

async function updateTrackBadge() {
  const trackSelect = document.getElementById('profile-sub-track');
  if (!trackSelect) return;

  const selectedTrack = trackSelect.value;
  const badgeEl = document.getElementById('track-badge');

  if (badgeEl) badgeEl.textContent = `${selectedTrack} Specialist`;

  try {
    const profile = await ProfileRepository.get(currentUserId);
    await ProfileRepository.update(currentUserId, {
      displayName: profile.displayName,
      avatarSeed: profile.avatarSeed,
      track: selectedTrack,
      bio: profile.bio
    });
    if (document.activeElement === trackSelect) {
      showToast(`Specialization set to ${selectedTrack}! ✨`);
    }
  } catch (error) {
    console.error('❌ Error updating track:', error);
    showToast('Error updating track');
  }
}

// ============ PROFILE EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', () => {
  // Avatar click - using the block ID instead of inline onclick
  const avatarBlock = document.getElementById('profile-avatar-block');
  if (avatarBlock) {
    avatarBlock.addEventListener('click', (e) => {
      e.preventDefault();
      cycleAvatar();
    });
  }

  // Profile name edit
  const nameEl = document.getElementById('profile-display-name');
  if (nameEl) {
    nameEl.addEventListener('blur', async (e) => {
      const newName = e.target.textContent.trim() || 'ICT_Student_User';
      try {
        const profile = await ProfileRepository.get(currentUserId);
        await ProfileRepository.update(currentUserId, {
          displayName: newName,
          avatarSeed: profile.avatarSeed,
          track: profile.track,
          bio: profile.bio
        });
        showToast('Profile name updated! ✨');
      } catch (error) {
        console.error('❌ Error updating name:', error);
        showToast('Error updating name');
      }
    });
  }

  // Profile bio edit
  const bioEl = document.getElementById('profile-bio');
  if (bioEl) {
    bioEl.addEventListener('blur', async (e) => {
      const newBio = e.target.value;
      try {
        const profile = await ProfileRepository.get(currentUserId);
        await ProfileRepository.update(currentUserId, {
          displayName: profile.displayName,
          avatarSeed: profile.avatarSeed,
          track: profile.track,
          bio: newBio
        });
        showToast('Bio saved! 📜');
      } catch (error) {
        console.error('❌ Error saving bio:', error);
        showToast('Error saving bio');
      }
    });
  }

  // Track selection change
  const trackSelect = document.getElementById('profile-sub-track');
  if (trackSelect) {
    trackSelect.addEventListener('change', updateTrackBadge);
  }
});

// ============================================
// AUTHENTICATION SYSTEM
// ============================================

let currentUser = null;
let isLoggedIn = false;

async function userExists(username) {
  try {
    const allUsers = await db.getAll('users');
    return allUsers.some(user => user.username === username);
  } catch (error) {
    console.error('Error checking user:', error);
    return false;
  }
}

async function registerUser(username, email, password) {
  try {
    const exists = await userExists(username);
    if (exists) {
      showToast('❌ Username already exists!');
      return false;
    }

    const user = {
      username: username,
      email: email,
      password: password,
      createdAt: new Date().toISOString(),
      userId: username
    };

    await db.add('users', user);

    await ProfileRepository.update(username, {
      displayName: username,
      avatarSeed: 'taskahead',
      track: 'General ICT',
      bio: 'Welcome to TaskAhead!⌨️'
    });

    await GamificationRepository.update(username, {
      xp: 0,
      plantTier: 'Seedling',
      lastUpdated: new Date().toISOString()
    });

    showToast('✅ Registration successful! Please login.');
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    showToast('❌ Registration failed. Please try again.');
    return false;
  }
}

async function loginUser(username, password) {
  try {
    const allUsers = await db.getAll('users');
    const user = allUsers.find(u => u.username === username && u.password === password);

    if (!user) {
      showToast('❌ Invalid username or password!');
      return false;
    }

    currentUser = user;
    isLoggedIn = true;
    currentUserId = username;

    await loadAllData();
    refreshAllUI();
    updateAuthUI();

    showToast(`✅ Welcome back, ${username}! ⌨`);
    return true;
  } catch (error) {
    console.error('Login error:', error);
    showToast('❌ Login failed. Please try again.');
    return false;
  }
}

async function logoutUser() {
  currentUser = null;
  isLoggedIn = false;
  currentUserId = 'default-user';

  await loadAllData();
  refreshAllUI();
  updateAuthUI();

  showToast('👋 Logged out successfully!');
}

function updateAuthUI() {
  const loginBtn = document.querySelector('.mt-login-btn');
  const navLoginBtns = document.querySelectorAll('.nav-btn[data-target="auth-section"]');
  const authStatusText = document.getElementById('auth-status-text');

  if (isLoggedIn && currentUser) {
    if (loginBtn) {
      loginBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> ${currentUser.username}`;
      loginBtn.style.color = 'var(--mint)';
    }
    navLoginBtns.forEach(btn => {
      btn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout (${currentUser.username})`;
      btn.dataset.target = 'logout';
    });
    if (authStatusText) {
      authStatusText.innerHTML = `✅ Logged in as: <strong>${currentUser.username}</strong>`;
      authStatusText.style.color = 'var(--mint)';
    }
  } else {
    if (loginBtn) {
      loginBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i>`;
      loginBtn.style.color = '';
    }
    navLoginBtns.forEach(btn => {
      btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login / Register`;
      btn.dataset.target = 'auth-section';
    });
    if (authStatusText) {
      authStatusText.innerHTML = '🔓 Not logged in';
      authStatusText.style.color = 'var(--ink-soft)';
    }
  }
}

// ============ AUTH FORM HANDLERS ============
document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('db-register-form');
  const loginForm = document.getElementById('db-login-form');

  if(regForm){
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('reg-uid').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-pwd').value;
      const statusEl = document.getElementById('register-status');

      if (!username || !email || !password) {
        if (statusEl) { statusEl.innerHTML = '❌ Please fill in all fields'; statusEl.style.color = 'var(--pink)'; }
        return;
      }

      if (password.length < 6) {
        if (statusEl) { statusEl.innerHTML = '❌ Password must be at least 6 characters'; statusEl.style.color = 'var(--pink)'; }
        return;
      }

      if (statusEl) { statusEl.innerHTML = '⏳ Creating account...'; statusEl.style.color = 'var(--ink-soft)'; }

      const success = await registerUser(username, email, password);

      if (success) {
        if (statusEl) { statusEl.innerHTML = '✅ Account created! Please login.'; statusEl.style.color = 'var(--mint)'; }
        regForm.reset();
      } else {
        if (statusEl) { statusEl.innerHTML = '❌ Username already exists or error occurred'; statusEl.style.color = 'var(--pink)'; }
      }
    });
  }

  if(loginForm){
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('login-uid').value.trim();
      const password = document.getElementById('login-pwd').value;
      const statusEl = document.getElementById('login-status');

      if (!username || !password) {
        if (statusEl) { statusEl.innerHTML = '❌ Please enter username and password'; statusEl.style.color = 'var(--pink)'; }
        return;
      }

      if (statusEl) { statusEl.innerHTML = '⏳ Logging in...'; statusEl.style.color = 'var(--ink-soft)'; }

      const success = await loginUser(username, password);

      if (success) {
        if (statusEl) { statusEl.innerHTML = '✅ Login successful! Welcome back! ⚓'; statusEl.style.color = 'var(--mint)'; }
        loginForm.reset();
        document.querySelector('.nav-btn[data-target="dashboard"]')?.click();
      } else {
        if (statusEl) { statusEl.innerHTML = '❌ Invalid username or password'; statusEl.style.color = 'var(--pink)'; }
      }
    });
  }
});

// Handle logout
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.nav-btn');
  if (btn && btn.dataset.target === 'logout') {
    e.preventDefault();
    await logoutUser();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
});

// ============ AMBIENT AUDIO SYNTHESIZER ============ //
let ambAudioCtx = null;
const activeSounds = {};

function getAmbContext() {
  if (!ambAudioCtx) {
    ambAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ambAudioCtx.state === 'suspended') {
    ambAudioCtx.resume();
  }
  return ambAudioCtx;
}

// Generates smooth pink noise buffer
function createNoiseBuffer(ctx) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

// Stop sound helper
function stopAmbientSound(type, btnId) {
  const btn = document.getElementById(btnId);
  if (activeSounds[type]) {
    if (activeSounds[type].interval) clearInterval(activeSounds[type].interval);
    if (activeSounds[type].gain) {
      activeSounds[type].gain.gain.exponentialRampToValueAtTime(0.0001, ambAudioCtx.currentTime + 0.4);
    }
    setTimeout(() => {
      if (activeSounds[type] && activeSounds[type].src) {
        activeSounds[type].src.stop();
      }
      delete activeSounds[type];
    }, 450);
  }
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-play"></i>';
    btn.classList.remove('active');
  }
}

// 1. COZY RAIN
function toggleRainSound(type, btnId, volId) {
  if (activeSounds[type]) return stopAmbientSound(type, btnId);
  const ctx = getAmbContext();
  const src = ctx.createBufferSource();
  src.buffer = createNoiseBuffer(ctx);
  src.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(parseFloat(document.getElementById(volId).value), ctx.currentTime);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();

  activeSounds[type] = { src, gain, filter };
  document.getElementById(btnId).innerHTML = '<i class="fa-solid fa-pause"></i>';
}

// 2. FOREST BIRDS
function toggleBirdsSound(type, btnId, volId) {
  if (activeSounds[type]) return stopAmbientSound(type, btnId);
  const ctx = getAmbContext();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(parseFloat(document.getElementById(volId).value), ctx.currentTime);
  gain.connect(ctx.destination);

  const chirp = () => {
    if (!activeSounds[type]) return;
    const osc = ctx.createOscillator();
    const chirpGain = ctx.createGain();
    const startFreq = 2200 + Math.random() * 800;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq + 600, ctx.currentTime + 0.1);
    chirpGain.gain.setValueAtTime(0.08, ctx.currentTime);
    chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(chirpGain);
    chirpGain.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const interval = setInterval(() => {
    if (Math.random() > 0.4) {
      chirp();
      if (Math.random() > 0.5) setTimeout(chirp, 160);
    }
  }, 2000);

  activeSounds[type] = { gain, interval };
  document.getElementById(btnId).innerHTML = '<i class="fa-solid fa-pause"></i>';
}

// 3. CHILL WAVES
function toggleWavesSound(type, btnId, volId) {
  if (activeSounds[type]) return stopAmbientSound(type, btnId);
  const ctx = getAmbContext();
  const src = ctx.createBufferSource();
  src.buffer = createNoiseBuffer(ctx);
  src.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 350;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(parseFloat(document.getElementById(volId).value), ctx.currentTime);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();

  let up = true;
  const interval = setInterval(() => {
    if (filter.frequency) {
      filter.frequency.exponentialRampToValueAtTime(up ? 800 : 250, ctx.currentTime + 4);
      up = !up;
    }
  }, 4500);

  activeSounds[type] = { src, gain, filter, interval };
  document.getElementById(btnId).innerHTML = '<i class="fa-solid fa-pause"></i>';
}

// 4. PINK NOISE
function togglePinkNoise(type, btnId, volId) {
  if (activeSounds[type]) return stopAmbientSound(type, btnId);
  const ctx = getAmbContext();
  const src = ctx.createBufferSource();
  src.buffer = createNoiseBuffer(ctx);
  src.loop = true;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(parseFloat(document.getElementById(volId).value) * 0.8, ctx.currentTime);

  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();

  activeSounds[type] = { src, gain };
  document.getElementById(btnId).innerHTML = '<i class="fa-solid fa-pause"></i>';
}

// 5. COZY CAMPFIRE
function toggleFireSound(type, btnId, volId) {
  if (activeSounds[type]) return stopAmbientSound(type, btnId);
  const ctx = getAmbContext();
  
  // Low rumble base
  const src = ctx.createBufferSource();
  src.buffer = createNoiseBuffer(ctx);
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(parseFloat(document.getElementById(volId).value), ctx.currentTime);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();

  // Crackle pop generator
  const interval = setInterval(() => {
    if (Math.random() > 0.3) {
      const popSrc = ctx.createBufferSource();
      popSrc.buffer = createNoiseBuffer(ctx);
      const popFilter = ctx.createBiquadFilter();
      popFilter.type = 'highpass';
      popFilter.frequency.value = 2500;

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.12 * Math.random(), ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      popSrc.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(gain);

      popSrc.start();
      popSrc.stop(ctx.currentTime + 0.05);
    }
  }, 120);

  activeSounds[type] = { src, gain, interval };
  document.getElementById(btnId).innerHTML = '<i class="fa-solid fa-pause"></i>';
}

// 6. CLOCK TICKING
function toggleClockSound(type, btnId, volId) {
  if (activeSounds[type]) return stopAmbientSound(type, btnId);
  const ctx = getAmbContext();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(parseFloat(document.getElementById(volId).value), ctx.currentTime);
  gain.connect(ctx.destination);

  let highTick = true;
  const interval = setInterval(() => {
    const osc = ctx.createOscillator();
    const tickGain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(highTick ? 1200 : 800, ctx.currentTime);
    
    tickGain.gain.setValueAtTime(0.1, ctx.currentTime);
    tickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(tickGain);
    tickGain.connect(gain);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
    highTick = !highTick;
  }, 1000);

  activeSounds[type] = { gain, interval };
  document.getElementById(btnId).innerHTML = '<i class="fa-solid fa-pause"></i>';
}

// 7. RUSTLING LEAVES
function toggleLeavesSound(type, btnId, volId) {
  if (activeSounds[type]) return stopAmbientSound(type, btnId);
  const ctx = getAmbContext();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(parseFloat(document.getElementById(volId).value), ctx.currentTime);
  gain.connect(ctx.destination);

  const rustle = () => {
    if (!activeSounds[type]) return;
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800 + Math.random() * 800;
    filter.Q.value = 3;

    const rustleGain = ctx.createGain();
    rustleGain.gain.setValueAtTime(0.01, ctx.currentTime);
    rustleGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.2);
    rustleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    src.connect(filter);
    filter.connect(rustleGain);
    rustleGain.connect(gain);

    src.start();
    src.stop(ctx.currentTime + 0.65);
  };

  const interval = setInterval(() => {
    if (Math.random() > 0.3) rustle();
  }, 1400);

  activeSounds[type] = { gain, interval };
  document.getElementById(btnId).innerHTML = '<i class="fa-solid fa-pause"></i>';
}

// 8. BLIZZARD WIND
function toggleWindSound(type, btnId, volId) {
  if (activeSounds[type]) return stopAmbientSound(type, btnId);
  const ctx = getAmbContext();
  const src = ctx.createBufferSource();
  src.buffer = createNoiseBuffer(ctx);
  src.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 300;
  filter.Q.value = 4.0;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(parseFloat(document.getElementById(volId).value), ctx.currentTime);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();

  // Howling wind oscillation
  const interval = setInterval(() => {
    if (filter.frequency) {
      const targetFreq = 200 + Math.random() * 600;
      filter.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 2.5);
    }
  }, 3000);

  activeSounds[type] = { src, gain, filter, interval };
  document.getElementById(btnId).innerHTML = '<i class="fa-solid fa-pause"></i>';
}

// Attach All Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-sound-rain')?.addEventListener('click', () => toggleRainSound('rain', 'btn-sound-rain', 'rain-vol'));
  document.getElementById('btn-sound-birds')?.addEventListener('click', () => toggleBirdsSound('birds', 'btn-sound-birds', 'birds-vol'));
  document.getElementById('btn-sound-waves')?.addEventListener('click', () => toggleWavesSound('waves', 'btn-sound-waves', 'waves-vol'));
  document.getElementById('btn-sound-pink')?.addEventListener('click', () => togglePinkNoise('pink', 'btn-sound-pink', 'pink-vol'));
  document.getElementById('btn-sound-fire')?.addEventListener('click', () => toggleFireSound('fire', 'btn-sound-fire', 'fire-vol'));
  document.getElementById('btn-sound-clock')?.addEventListener('click', () => toggleClockSound('clock', 'btn-sound-clock', 'clock-vol'));
  document.getElementById('btn-sound-leaves')?.addEventListener('click', () => toggleLeavesSound('leaves', 'btn-sound-leaves', 'leaves-vol'));
  document.getElementById('btn-sound-wind')?.addEventListener('click', () => toggleWindSound('wind', 'btn-sound-wind', 'wind-vol'));

  // Master Volume sliders listeners
  const soundKeys = ['rain', 'birds', 'waves', 'pink', 'fire', 'clock', 'leaves', 'wind'];
  soundKeys.forEach(sound => {
    document.getElementById(`${sound}-vol`)?.addEventListener('input', (e) => {
      if (activeSounds[sound] && activeSounds[sound].gain) {
        const factor = sound === 'pink' ? 0.8 : 1.0;
        activeSounds[sound].gain.gain.setValueAtTime(parseFloat(e.target.value) * factor, ambAudioCtx.currentTime);
      }
    });
  });
});

/* ============ OVERRIDE FOCUS TIMER LOGIC ============ */
(function setupFocusTimer() {
  let focusTimerInterval = null;
  let focusIsRunning = false;

  function toggleFocusTimer() {
    const startBtn = document.getElementById('start-timer-btn');
    const minEl = document.getElementById('timer-minutes');
    const secEl = document.getElementById('timer-seconds');

    if (!minEl || !secEl) return;

    if (focusIsRunning) {
      // --- PAUSE ---
      clearInterval(focusTimerInterval);
      focusIsRunning = false;
      if (startBtn) startBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      minEl.setAttribute('contenteditable', 'true');
      secEl.setAttribute('contenteditable', 'true');
    } else {
      // --- START ---
      let minutes = parseInt(minEl.textContent.trim(), 10) || 0;
      let seconds = parseInt(secEl.textContent.trim(), 10) || 0;

      if (minutes === 0 && seconds === 0) {
        if (typeof showToast === 'function') showToast('Please set a time greater than 00:00');
        else alert('Please set a time greater than 00:00');
        return;
      }

      focusIsRunning = true;
      if (startBtn) startBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

      // Lock editing while counting down
      minEl.setAttribute('contenteditable', 'false');
      secEl.setAttribute('contenteditable', 'false');

      let totalSeconds = (minutes * 60) + seconds;

      clearInterval(focusTimerInterval);
      focusTimerInterval = setInterval(() => {
        totalSeconds--;

        if (totalSeconds <= 0) {
          clearInterval(focusTimerInterval);
          focusIsRunning = false;
          minEl.textContent = '00';
          secEl.textContent = '00';
          if (startBtn) startBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
          
          minEl.setAttribute('contenteditable', 'true');
          secEl.setAttribute('contenteditable', 'true');

          if (typeof showToast === 'function') {
            showToast('🎉 Focus session complete! Time for a 5-minute break.');
          } else {
            alert('🎉 Focus session complete! Time for a 5-minute break.');
          }
          return;
        }

        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        minEl.textContent = m.toString().padStart(2, '0');
        secEl.textContent = s.toString().padStart(2, '0');
      }, 1000);
    }
  }

  function resetFocusTimer() {
    clearInterval(focusTimerInterval);
    focusIsRunning = false;

    const startBtn = document.getElementById('start-timer-btn');
    const minEl = document.getElementById('timer-minutes');
    const secEl = document.getElementById('timer-seconds');

    if (startBtn) startBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    if (minEl) {
      minEl.textContent = '25';
      minEl.setAttribute('contenteditable', 'true');
    }
    if (secEl) {
      secEl.textContent = '00';
      secEl.setAttribute('contenteditable', 'true');
    }
  }

  function initTimerListeners() {
    const startBtn = document.getElementById('start-timer-btn');
    const resetBtn = document.getElementById('reset-timer-btn');

    if (startBtn) {
      // Replaces old button listeners completely
      const newStart = startBtn.cloneNode(true);
      startBtn.parentNode.replaceChild(newStart, startBtn);
      newStart.addEventListener('click', toggleFocusTimer);
    }

    if (resetBtn) {
      const newReset = resetBtn.cloneNode(true);
      resetBtn.parentNode.replaceChild(newReset, resetBtn);
      newReset.addEventListener('click', resetFocusTimer);
    }

    // Input sanitization & formatting
    ['timer-minutes', 'timer-seconds'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener('blur', () => {
        let val = parseInt(el.textContent.replace(/\D/g, ''), 10);
        if (isNaN(val) || val < 0) val = 0;
        if (id === 'timer-seconds' && val > 59) val = 59;
        el.textContent = val.toString().padStart(2, '0');
      });

      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          el.blur();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimerListeners);
  } else {
    initTimerListeners();
  }
})();

function setAppTheme(themeName) {
  // Remove any previously set theme classes
  document.body.classList.remove('theme-whitecap', 'theme-black-sails', 'theme-ivory-dice', 'theme-cursed-gold');
  
  // Add the new selected theme class
  document.body.classList.add(`theme-${themeName}`);

  // Whitecap & Ivory Dice are light-based, Black Sails & Cursed Gold are dark-based.
  // Keep data-theme in sync so the starfield / firefly / glow rules react correctly.
  const isDarkFamily = (themeName === 'black-sails' || themeName === 'cursed-gold');
  document.documentElement.setAttribute('data-theme', isDarkFamily ? 'dark' : 'light');
  if (isDarkFamily) {
    if (typeof spawnFireflies === 'function') spawnFireflies();
  } else {
    if (typeof clearFireflies === 'function') clearFireflies();
  }
  
  // Save preference locally
  localStorage.setItem('preferred-theme', themeName);
}

// Auto-load saved theme on page startup
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('preferred-theme') || 'whitecap';
  setAppTheme(savedTheme);
  
  // Keep radio button checked state in sync
  const activeRadio = document.querySelector(`input[name="app-theme"][value="${savedTheme}"]`);
  if (activeRadio) activeRadio.checked = true;
});




// ============================================
// END OF AUTHENTICATION SYSTEM
// ============================================