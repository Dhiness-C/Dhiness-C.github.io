// Clean, self-initializing in-page terminal
(function(){
  const out = document.getElementById('terminal-output');
  if(!out) return;

  const PROMPT = (function(){
    try { return (window.COMPUTER_NAME || 'visitor') + '@local:~$'; } catch(e){ return 'visitor@local:~$'; }
  })();

  let history = [];
  let hidx = 0;

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
        'soundcloud — link to SoundCloud.',
        'date — current date/time.',
        'echo — repeats whatever you say :).',
        'clear — clears the terminal.'
      ].join('\n');
    },
    about(){ return 'My name is Dhiness.C.\nI love to build things that is completely different to what I know, only so I can learn more.\n I also love bouldering, its my escape from reality.\n I do a lot of personal projects in my free time.'; },
    projects(){ return 'projects:\n- tiny-audio\n- retro-tools\n- misc experiments\n(see GitHub)'; },
    github(){ return 'https://github.com/Dhiness-C'; },
    soundcloud(){ return 'https://soundcloud.com/'; },
    contact(){ return 'discord: Dhiness#0000\nemail: you@example.com'; },
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

  function createPrompt(){
    const line = document.createElement('div');
    line.className = 'terminal-line';

    const promptSpan = document.createElement('span');
    promptSpan.className = 'prompt';
    promptSpan.textContent = PROMPT + ' ';

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
        createPrompt();
      } else if(e.key === 'ArrowUp'){
        if(history.length && hidx>0) hidx--; input.value = history[hidx]||''; e.preventDefault();
      } else if(e.key === 'ArrowDown'){
        if(history.length && hidx < history.length-1) { hidx++; input.value = history[hidx]||''; } else { hidx = history.length; input.value=''; }
      }
      out.scrollTop = out.scrollHeight;
    });
  }

  // initial content and prompt
  writeLine('<div>Welcome to Dhiness. C — type <strong>help</strong> to get started.</div>');
  createPrompt();

})();
