// Minimal in-page terminal emulator
(function(){
  const out = document.getElementById('terminal-output');
  const form = document.getElementById('terminal-form');
  const input = document.getElementById('cmd');
  const promptStr = 'dhiness@local:~$';
  let history = [];
  let hidx = 0;

  function write(text, opts={}){
    const el = document.createElement('div');
    el.innerHTML = text;
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
  }

  function clear(){ out.innerHTML = ''; }

  const commands = {
    help(){
      return `available commands: help about projects github soundcloud clear date echo contact`; 
    },
    about(){
      return `dhiness. c — tinkerer, dev, audio hobbyist.\nI like retro terminals, small hardware projects, and neat sonic experiments.`;
    },
    projects(){
      return `projects:\n- tiny-audio\n- retro-tools\n- misc experiments\n(visit my GitHub)`;
    },
    github(){
      return `<a href="https://github.com/yourname" target="_blank">https://github.com/yourname</a>`;
    },
    soundcloud(){
      return `<a href="https://soundcloud.com/" target="_blank">https://soundcloud.com/</a>`;
    },
    contact(){
      return `discord: Dhiness#0000 (replace with yours)\nemail: you@example.com`;
    },
    date(){ return new Date().toString(); },
    echo(...args){ return args.join(' '); },
    clear(){ clear(); return ''; }
  };

  function runCommand(line){
    if(!line.trim()) return '';
    const parts = line.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    if(commands[cmd]) return commands[cmd].apply(null,args);
    return `command not found: ${cmd}`;
  }

  function renderPrompt(){
    const p = document.createElement('div');
    p.innerHTML = `<span class="prompt">${promptStr}</span> ` +
      `<span class="input-placeholder" aria-hidden="true"></span>`;
    return p;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = input.value;
    history.push(val);
    hidx = history.length;
    const promptLine = `<div><span class="prompt">${promptStr}</span> <span>${escapeHtml(val)}</span></div>`;
    write(promptLine);
    const res = runCommand(val);
    if(res !== '') write(`<div>${escapeHtml(res)}</div>`);
    input.value = '';
    input.focus();
  });

  input.addEventListener('keydown', e => {
    if(e.key === 'ArrowUp'){
      if(history.length && hidx>0) hidx--; input.value = history[hidx]||''; e.preventDefault();
    } else if(e.key === 'ArrowDown'){
      if(history.length && hidx < history.length-1) { hidx++; input.value = history[hidx]||''; } else { hidx = history.length; input.value=''; }
    }
  });

  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // welcome message
  document.addEventListener('DOMContentLoaded', () => {
    write('<div>Welcome to Dhiness. C — type <strong>help</strong> to get started.</div>');
  });

})();
