// Clean, self-initializing in-page terminal
(function(){
  const out = document.getElementById('terminal-output');
  if(!out) return;

  // virtual filesystem and dynamic prompt
  const vfs = {
    type: 'dir',
    name: '/',
    entries: {
      'main': { type: 'dir', entries: { 'README.txt': { type: 'file', content: 'Welcome to the main folder.' } } },
      'games': { type: 'dir', entries: { 'snake': { type: 'file', content: 'A terminal snake game will be here.' } } }
    }
  };

  let currentPath = '/'; // start at root where `ls` shows `main` and `games`

  function resolvePath(path){
    if(!path) return null;
    const parts = path.split('/').filter(Boolean);
    let node = vfs;
    for(const p of parts){
      if(!node || node.type !== 'dir' || !node.entries[p]) return null;
      node = node.entries[p];
    }
    return node;
  }

  function joinPath(base, name){
    if(name === '/' ) return '/';
    if(name.startsWith('/')) return name;
    if(base === '/') return `/${name}`;
    return `${base}/${name}`;
  }

  function displayPath(path){
    if(path === '/' ) return '~';
    return '~' + path;
  }

  function getDeviceName(){
    // Force a consistent anonymous prompt label for privacy
    return 'visitor';
  }

  function getPrompt(){
    return getDeviceName() + '@local:' + displayPath(currentPath) + '$';
  }

  let history = [];
  let hidx = 0;
  const START_TS = Date.now();
  let neofetchInterval = null;

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function writeLine(html){
    const el = document.createElement('div');
    el.className = 'terminal-line';
    el.innerHTML = html;
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
    return el;
  }

  function clear(){ out.innerHTML = ''; }

    const commands = {
    help(){
      return [
        'help — show this list of commands',
        'about — short bio',
        'projects — a brief project list',
        'github — link to my GitHub profile',
        'date — current date/time.',
        'ls — list files in the current directory',
        'cd — change directory (e.g. cd games)',
        'echo — repeats whatever you say :).',
        'neofetch — show system information',
        'clear — clears the terminal.'
      ].join('\n');
    },
    about(){ return 'My name is Dhiness.C.\nI love to build things that is completely different to what I know, only so I can learn more.\n I also love bouldering, its my escape from reality.\n Chess is the next best thing to do after bouldering for me.\n Best project of the year award in ISDC 2023.\n Third Place in spUN Debates 2025.\n I am currently an A-level Student doing 4 A-levels: Mathematics, Physics, Computer Science and Further Mathematics.'; },
    projects(){ return 'projects:\n- A finance tracking software\n- Lots of discord bots for various servers\n- An AI assistant that runs locally\n- lots of other\n(for first three, see GitHub)'; },
    github(){ return 'https://github.com/Dhiness-C'; },

    date(){ return new Date().toString(); },
    echo(...args){ return args.join(' '); },
    clear(){ clear(); return ''; },
    neofetch(){ return ''; }
  };
  function runCommand(line){
    if(!line.trim()) return '';
    const parts = line.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // builtin: ls
    if(cmd === 'ls'){
      const node = resolvePath(currentPath);
      if(!node || node.type !== 'dir') return 'ls: not a directory';
      const names = Object.keys(node.entries || {}).map(n => node.entries[n].type === 'dir' ? n + '/' : n);
      return names.join('\n');
    }

    // builtin: cd
    if(cmd === 'cd'){
      const target = args[0] || '/';
      if(target === '/') { currentPath = '/'; return ''; }
      if(target === '..'){
        if(currentPath === '/') return '';
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        currentPath = parts.length ? '/' + parts.join('/') : '/';
        return '';
      }
      const newPath = joinPath(currentPath === '/' ? '/' : currentPath, target);
      const node = resolvePath(newPath);
      if(node && node.type === 'dir') { currentPath = newPath; return ''; }
      return `cd: no such file or directory: ${target}`;
    }

    // launch snake if requested and available in current dir
    if(cmd === 'neofetch'){
      // clear any previous updater
      try{ if(neofetchInterval) clearInterval(neofetchInterval); }catch(e){}
      const name = getDeviceName();
      const ua = navigator.userAgent || navigator.platform || '';
      const os = 'MaineCoonOS v3.2.1';
      function fmtUptime(ms){
        const s = Math.floor(ms/1000);
        const days = Math.floor(s/86400); const hrs = Math.floor((s%86400)/3600);
        const mins = Math.floor((s%3600)/60); const secs = s%60;
        return (days?days+"d ":"") + (hrs?hrs+"h ":"") + (mins?mins+"m ":"") + secs+"s";
      }
      const resolution = `${window.screen.width}x${window.screen.height}`;
      const html = `
<div class="neofetch-wrap" style="display:flex;gap:12px;align-items:flex-start">
    <pre style="margin:0;line-height:1;font-family:monospace">     (\_/)
       ( o.o )
        > ^ <</pre>
  <div style="font-family:monospace;line-height:1.3">
    <div><strong>${name}@local</strong></div>
    <div>OS: ${os}</div>
    <div>Kernel: 5.16.0</div>
    <div>Uptime: <span class="uptime">${fmtUptime(Date.now()-START_TS)}</span></div>
    <div>Resolution: <span class="resolution">${resolution}</span></div>
    <div>Packages: 123 (apt)</div>
    <div>Shell: web-terminal</div>
    <div>CPU: Intel Core i9</div>
    <div>GPU: Vega</div>
    <div>Memory: 4096MiB / 8192MiB</div>
  </div>
</div>`;
      writeLine(html);
      // update uptime and resolution every second
      neofetchInterval = setInterval(()=>{
        const el = out.querySelector('.neofetch-wrap .uptime');
        const resEl = out.querySelector('.neofetch-wrap .resolution');
        if(el) el.textContent = fmtUptime(Date.now()-START_TS);
        if(resEl) resEl.textContent = `${window.screen.width}x${window.screen.height}`;
      },1000);
      return '';
    }

    // simulate destructive remove - show progress and finish with 404 (do not actually delete)
    if(cmd === 'rm' && args.includes('-rf')){
      try{ if(neofetchInterval) clearInterval(neofetchInterval); }catch(e){}
      // create progress container
      const el = writeLine('<div class="rm-progress" style="font-family:monospace"></div>');

      // collect some example paths from the virtual fs to display
      const files = [];
      (function collect(node, cur){
        if(!node) return;
        if(node.type === 'file') { files.push(cur); return; }
        if(node.type === 'dir'){
          for(const k of Object.keys(node.entries || {})){
            const next = (cur === '/') ? `/${k}` : `${cur}/${k}`;
            collect(node.entries[k], next);
          }
        }
      })(vfs, '/');

      if(files.length === 0) files.push('/dev/null');

      let idx = 0;
      function pctFor(i,total){ return Math.min(100, Math.floor((i/total)*100)); }
      const total = Math.max(1, files.length);
      const tid = setInterval(()=>{
        const p = pctFor(idx,total);
        const blocks = Math.floor(p/5);
        const bar = '[' + '#'.repeat(blocks) + ' '.repeat(20-blocks) + '] ' + p + '%';
        const shown = files.slice(0, Math.min(idx+1, files.length)).map(f=>`deleted: ${f}`).join('<br>');
        el.innerHTML = `Deleting... ${bar}<br>${shown}`;
        idx++;
        if(idx > total){
          clearInterval(tid);
          el.innerHTML = 'Deleting... [####################] 100%<br>Operation complete.';
          setTimeout(()=>{
            writeLine('<div style="color:#c00;font-weight:700;font-family:monospace">404 — Not Found</div>');
            createPrompt();
          }, 800);
        }
      }, 120);

      // prevent immediate prompt; we'll re-create when done
      return '__GAME_START__';
    }

    // launch snake if requested and available in current dir
    if(cmd === 'snake'){
      const node = resolvePath(joinPath(currentPath === '/' ? '/' : currentPath, 'games'));
      // allow starting snake only if in /games or the file exists in current dir
      const inGames = currentPath === '/games' || (resolvePath(joinPath(currentPath, 'snake')) && resolvePath(joinPath(currentPath, 'snake')).type === 'file');
      if(inGames){ startSnakeGame(); return '__GAME_START__'; }
      return 'snake: command not found';
    }

    // fallback to existing command table
    if(commands[cmd]) return commands[cmd].apply(null,args);
    return `command not found: ${cmd}`;
  }

  function createPrompt(){
    const line = document.createElement('div');
    line.className = 'terminal-line';

    const promptSpan = document.createElement('span');
    promptSpan.className = 'prompt';
    promptSpan.textContent = getPrompt() + ' ';

    const input = document.createElement('input');
    input.className = 'terminal-input';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('aria-label','terminal command input');

    line.appendChild(promptSpan);
    line.appendChild(input);
    out.appendChild(line);
    input.focus();

    input.addEventListener('keydown', e => {
      if(e.key === 'Enter'){
        const val = input.value;
        history.push(val);
        hidx = history.length;
        const text = document.createElement('span');
        text.className = 'cmd-text';
        text.innerHTML = esc(val);
        line.removeChild(input);
        line.appendChild(text);

        const res = runCommand(val);
        if(res !== ''){
          const html = esc(res).replace(/\n/g,'<br>');
          writeLine(html);
        }
        // if a game was started, runCommand returns '__GAME_START__' and we must NOT create a new prompt
        if(res !== '__GAME_START__') createPrompt();
      } else if(e.key === 'ArrowUp'){
        if(history.length && hidx>0) hidx--; input.value = history[hidx]||''; e.preventDefault();
      } else if(e.key === 'ArrowDown'){
        if(history.length && hidx < history.length-1) { hidx++; input.value = history[hidx]||''; } else { hidx = history.length; input.value=''; }
      }
      out.scrollTop = out.scrollHeight;
    });
  }

  // --- Snake game implementation ---
  function startSnakeGame(){
    writeLine('<div>Starting Snake — use Arrow keys or WASD. Press Q to quit.</div>');
    const rows = 12, cols = 24;
    const gridEl = document.createElement('pre');
    gridEl.className = 'snake-grid';
    gridEl.style.fontFamily = 'monospace';
    gridEl.style.fontSize = '14px';
    gridEl.style.lineHeight = '1';
    gridEl.style.margin = '6px 0';
    out.appendChild(gridEl);
    out.scrollTop = out.scrollHeight;

    let snake = [{x: Math.floor(cols/2), y: Math.floor(rows/2)}];
    let dir = {x:1,y:0};
    let food = null;
    let score = 0;
    let running = true;

    function placeFood(){
      while(true){
        const fx = Math.floor(Math.random()*cols);
        const fy = Math.floor(Math.random()*rows);
        if(!snake.some(s=>s.x===fx && s.y===fy)){ food = {x:fx,y:fy}; break; }
      }
    }
    placeFood();

    function draw(){
      let outStr = '';
      for(let y=0;y<rows;y++){
        for(let x=0;x<cols;x++){
          if(snake[0].x===x && snake[0].y===y) outStr += 'O';
          else if(snake.slice(1).some(s=>s.x===x && s.y===y)) outStr += 'o';
          else if(food && food.x===x && food.y===y) outStr += '*';
          else outStr += '.';
        }
        outStr += '\n';
      }
      gridEl.textContent = outStr + '\nScore: ' + score;
      out.scrollTop = out.scrollHeight;
    }

    function gameOver(){
      running = false;
      document.removeEventListener('keydown', keyHandler);
      clearInterval(tid);
      writeLine('<div>Game over — score: ' + score + '</div>');
      gridEl.remove();
      createPrompt();
    }

    function step(){
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      // walls collision
      if(head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) return gameOver();
      // self collision
      if(snake.some(s=>s.x===head.x && s.y===head.y)) return gameOver();
      snake.unshift(head);
      if(food && head.x===food.x && head.y===food.y){ score++; placeFood(); }
      else snake.pop();
      draw();
    }

    function keyHandler(e){
      const k = e.key;
      if(k === 'ArrowUp' || k === 'w' || k === 'W') { if(dir.y!==1) dir = {x:0,y:-1}; e.preventDefault(); }
      else if(k === 'ArrowDown' || k === 's' || k === 'S') { if(dir.y!==-1) dir = {x:0,y:1}; e.preventDefault(); }
      else if(k === 'ArrowLeft' || k === 'a' || k === 'A') { if(dir.x!==1) dir = {x:-1,y:0}; e.preventDefault(); }
      else if(k === 'ArrowRight' || k === 'd' || k === 'D') { if(dir.x!==-1) dir = {x:1,y:0}; e.preventDefault(); }
      else if(k === 'q' || k === 'Q') { gameOver(); }
    }

    document.addEventListener('keydown', keyHandler);
    draw();
    const tid = setInterval(()=>{ if(running) step(); }, 180);
  }

  // initial content and prompt
  writeLine('<div>Welcome to my domain fellow visitor, how may I help you? — type <strong>help</strong> to get started.</div>');
  createPrompt();

})();
