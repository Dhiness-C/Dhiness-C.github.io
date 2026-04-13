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

  (function(){
    const out = document.getElementById('terminal-output');
    const promptStr = 'visitor@local:~$';
    let history = [];
    let hidx = 0;

    function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

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
      help(){ return 'available commands: help about projects github soundcloud clear date echo contact'; },
      about(){ return 'My name is Dhiness.C \nI like coding and building things. \n I also love bouldering with my friends. \n This would not be complete if I did not mention that I also love playing games.'; },
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
      promptSpan.textContent = promptStr + ' ';
      const input = document.createElement('input');
      input.className = 'terminal-input';
      input.autocomplete = 'off';
      input.spellcheck = false;
      line.appendChild(promptSpan);
      line.appendChild(input);
      out.appendChild(line);
      input.focus();

      input.addEventListener('keydown', e => {
        if(e.key === 'Enter'){
          const val = input.value;
          history.push(val);
          hidx = history.length;
          // replace input with plain text node
          const text = document.createElement('span');
          text.className = 'cmd-text';
          text.innerHTML = escapeHtml(val);
          line.removeChild(input);
          line.appendChild(text);

          // run
          const res = runCommand(val);
          if(res !== ''){
            // preserve line breaks
            const html = escapeHtml(res).replace(/\n/g,'<br>');
            writeLine(html);
          }
          // new prompt
          createPrompt();
        } else if(e.key === 'ArrowUp'){
          if(history.length && hidx>0) hidx--; input.value = history[hidx]||''; e.preventDefault();
        } else if(e.key === 'ArrowDown'){
          if(history.length && hidx < history.length-1) { hidx++; input.value = history[hidx]||''; } else { hidx = history.length; input.value=''; }
        }
        out.scrollTop = out.scrollHeight;
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      writeLine('<div>Welcome to Dhiness. C — type <strong>help</strong> to get started.</div>');
      createPrompt();
    });

  })();
