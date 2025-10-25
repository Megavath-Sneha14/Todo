// app.js — To‑Do app with filters, animations, and localStorage
(function(){
  const KEY = 'todo_app_v1';

  const form = document.getElementById('todoForm');
  const input = document.getElementById('todoInput');
  const listEl = document.getElementById('todoList');
  const emptyState = document.getElementById('emptyState');
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const countsEl = document.querySelector('.counts');

  let todos = [];
  let filter = 'all';

  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(todos)); }catch(e){}
  }
  function load(){
    try{ todos = JSON.parse(localStorage.getItem(KEY)) || []; }catch(e){ todos = [] }
  }

  function createId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6) }

  function counts(){
    const total = todos.length;
    const active = todos.filter(t=>!t.completed).length;
    const completed = total - active;
    countsEl.textContent = `${active} active • ${completed} completed`;
  }

  function setFilter(f){
    filter = f;
    filterButtons.forEach(btn => btn.setAttribute('aria-pressed', btn.dataset.filter === f ? 'true' : 'false'));
    render();
  }

  function filteredTodos(){
    if(filter === 'active') return todos.filter(t => !t.completed);
    if(filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function render(){
    listEl.innerHTML = '';
    const items = filteredTodos();
    if(items.length === 0){
      emptyState.hidden = false; 
    } else { emptyState.hidden = true }

    items.forEach(item => listEl.appendChild(renderItem(item)));
    counts();
  }

  function renderItem(item){
    const li = document.createElement('li');
    li.className = 'todo-item fadeInUp';
    li.dataset.id = item.id;

    const left = document.createElement('div'); left.className = 'todo-left';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!item.completed; cb.setAttribute('aria-label','Mark complete');
    const text = document.createElement('div'); text.className = 'todo-text'; text.textContent = item.text; text.tabIndex = 0;
    if(item.completed) li.classList.add('completed');

    cb.addEventListener('change', ()=>{
      item.completed = cb.checked;
      if(item.completed) li.classList.add('completed'); else li.classList.remove('completed');
      save();
      // re-render so the item moves between filtered lists (e.g., Active -> Completed)
      render();
      counts();
    });

    left.appendChild(cb); left.appendChild(text);

    const meta = document.createElement('div'); meta.className = 'todo-meta';

    const editBtn = document.createElement('button'); editBtn.className = 'action-btn'; editBtn.title = 'Edit';
    editBtn.innerHTML = '✏️';
    const delBtn = document.createElement('button'); delBtn.className = 'action-btn'; delBtn.title = 'Delete'; delBtn.innerHTML = '🗑️';

    let editing = false;
    function enterEdit(){ editing = true; text.contentEditable = 'true'; text.focus(); document.execCommand('selectAll', false, null); }
    function exitEdit(saveText=true){ if(!editing) return; editing = false; text.contentEditable = 'false'; if(saveText){ const v = text.textContent.trim(); if(v){ item.text = v; save(); } else { text.textContent = item.text; } } }

    editBtn.addEventListener('click', ()=>{ if(!editing) enterEdit(); else exitEdit(true); });
    text.addEventListener('keydown', e=>{ if(e.key === 'Enter'){ e.preventDefault(); exitEdit(true); } if(e.key === 'Escape'){ exitEdit(false); } });
    text.addEventListener('blur', ()=> exitEdit(true));

    delBtn.addEventListener('click', ()=>{
      li.classList.add('removing');
      li.addEventListener('animationend', ()=>{
        todos = todos.filter(t => t.id !== item.id);
        save(); render();
      }, {once:true});
    });

    meta.appendChild(editBtn); meta.appendChild(delBtn);
    li.appendChild(left); li.appendChild(meta);
    return li;
  }

  function add(text){
    const t = text.trim(); if(!t) return;
    todos.unshift({id:createId(), text:t, completed:false, created:Date.now()});
    save(); render();
  }

  form.addEventListener('submit', e=>{ e.preventDefault(); add(input.value); input.value=''; input.focus(); });
  filterButtons.forEach(b=> b.addEventListener('click', ()=> setFilter(b.dataset.filter)));

  // keyboard shortcut: press / to focus input
  window.addEventListener('keydown', (e)=>{ if(e.key === '/') { const active = document.activeElement; if(active && (active.tagName==='INPUT' || active.isContentEditable)) return; e.preventDefault(); input.focus(); } });

  // init
  load(); render();
  // expose for debug
  window._todos = todos;
})();
