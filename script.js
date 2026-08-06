/*
  script.js
  ----------------------------------------------------------------
  공개 갤러리 화면만 담당합니다. 등록/수정/삭제는 /admin/ (Decap CMS)에서
  처리되고, 그 내용은 배포 시 build-data.js가 만들어주는 data.js를 통해
  이 화면에 그대로 반영됩니다.
----------------------------------------------------------------
*/
const ALL_LABEL = "전체";

let allItems = [...PORTFOLIO_DATA];
let displayedItems = [];
let currentCategory = ALL_LABEL;

function getCategories(){
  const seen = [];
  allItems.forEach(item => {
    const c = (item.category || "").trim();
    if(c && !seen.includes(c)) seen.push(c);
  });
  return [ALL_LABEL, ...seen];
}

/* ---------------- CATEGORY MENU ---------------- */
function renderMenu(){
  const menu = document.getElementById("categoryMenu");
  menu.innerHTML = "";
  getCategories().forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "menu-pill" + (cat === currentCategory ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      currentCategory = cat;
      renderMenu();
      renderGrid();
    });
    menu.appendChild(btn);
  });
}

/* ---------------- GRID RENDER ---------------- */
function renderGrid(){
  const grid = document.getElementById("grid");
  const countTag = document.getElementById("itemCount");
  grid.innerHTML = "";

  displayedItems = currentCategory === ALL_LABEL
    ? allItems
    : allItems.filter(item => (item.category || "").trim() === currentCategory);

  countTag.textContent = String(displayedItems.length).padStart(3, "0") + " WORKS";

  if(displayedItems.length === 0){
    grid.innerHTML = `<div class="empty-state">${allItems.length === 0 ? '아직 등록된 작업물이 없습니다. 우측 상단 "관리자 페이지"에서 등록해보세요.' : '이 메뉴에 등록된 작업물이 없습니다.'}</div>`;
    return;
  }

  displayedItems.forEach((item, i) => {
    const el = document.createElement("div");
    el.className = "grid-item";

    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.backgroundImage = `url(${item.thumb})`;
    swatch.style.backgroundSize = "cover";
    swatch.style.backgroundPosition = "center";

    el.innerHTML = `<span class="item-index">${String(i+1).padStart(3,"0")}</span>`;
    el.appendChild(swatch);

    const caption = document.createElement("div");
    caption.className = "item-caption";
    caption.innerHTML = `<span class="t">${escapeHtml(item.title)}</span><span class="c">${escapeHtml(item.category || "")}</span>`;
    el.appendChild(caption);

    el.addEventListener("click", () => openDetail(i));
    grid.appendChild(el);
  });
}

function escapeHtml(str){
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

/* ---------------- DETAIL / DRAG VIEWER ---------------- */
const detailView = document.getElementById("detailView");
const detailViewport = document.getElementById("detailViewport");
const detailCanvas = document.getElementById("detailCanvas");
const detailHint = document.getElementById("detailHint");

function openDetail(index){
  const item = displayedItems[index];
  document.getElementById("detailIndex").textContent = String(index+1).padStart(3,"0");
  document.getElementById("detailTitle").textContent = item.title;

  detailCanvas.innerHTML = "";
  detailCanvas.style.transform = "translate(-50%, 0)";
  panState.x = 0; panState.y = 0;

  (item.details || []).forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.loading = "eager";
    detailCanvas.appendChild(img);
  });

  detailView.classList.add("open");
  detailView.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  detailHint.style.opacity = "1";
  setTimeout(() => { detailHint.style.opacity = "0"; }, 2200);

  requestAnimationFrame(() => clampPan());
}

document.getElementById("detailClose").addEventListener("click", closeDetail);
document.addEventListener("keydown", e => { if(e.key === "Escape") closeDetail(); });

function closeDetail(){
  detailView.classList.remove("open");
  detailView.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ---- 드래그로 상세페이지 살펴보기 (마우스/터치/휠 모두 지원) ---- */
const panState = { x:0, y:0, dragging:false, startX:0, startY:0, originX:0, originY:0 };

function clampPan(){
  const vpRect = detailViewport.getBoundingClientRect();
  const cRect = detailCanvas.getBoundingClientRect();
  const maxY = 0;
  const minY = Math.min(0, vpRect.height - cRect.height - 40);
  panState.y = Math.max(minY, Math.min(maxY, panState.y));
  const overflowX = Math.max(0, (cRect.width - vpRect.width) / 2);
  panState.x = Math.max(-overflowX, Math.min(overflowX, panState.x));
  applyPan();
}
function applyPan(){
  detailCanvas.style.transform = `translate(calc(-50% + ${panState.x}px), ${panState.y}px)`;
}

function dragStart(clientX, clientY){
  panState.dragging = true;
  panState.startX = clientX;
  panState.startY = clientY;
  panState.originX = panState.x;
  panState.originY = panState.y;
  detailViewport.classList.add("grabbing");
}
function dragMove(clientX, clientY){
  if(!panState.dragging) return;
  panState.x = panState.originX + (clientX - panState.startX);
  panState.y = panState.originY + (clientY - panState.startY);
  clampPan();
}
function dragEnd(){
  panState.dragging = false;
  detailViewport.classList.remove("grabbing");
}

detailViewport.addEventListener("mousedown", e => dragStart(e.clientX, e.clientY));
window.addEventListener("mousemove", e => dragMove(e.clientX, e.clientY));
window.addEventListener("mouseup", dragEnd);

detailViewport.addEventListener("touchstart", e => {
  const t = e.touches[0]; dragStart(t.clientX, t.clientY);
}, { passive:true });
detailViewport.addEventListener("touchmove", e => {
  const t = e.touches[0]; dragMove(t.clientX, t.clientY);
}, { passive:true });
detailViewport.addEventListener("touchend", dragEnd);

detailViewport.addEventListener("wheel", (e) => {
  e.preventDefault();
  panState.y -= e.deltaY;
  panState.x -= e.deltaX;
  clampPan();
}, { passive:false });

window.addEventListener("resize", () => { if(detailView.classList.contains("open")) clampPan(); });

/* ---------------- INIT ---------------- */
renderMenu();
renderGrid();
