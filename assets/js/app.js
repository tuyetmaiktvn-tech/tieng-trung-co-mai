document.addEventListener("DOMContentLoaded",()=>{
  const menuBtn=document.getElementById("mobileMenu");
  const nav=document.getElementById("navLinks");
  const dropdownBtns=document.querySelectorAll("[data-dropdown]");
  if(menuBtn&&nav) menuBtn.addEventListener("click",()=>nav.classList.toggle("open"));
  dropdownBtns.forEach(btn=>btn.addEventListener("click",e=>{
    e.stopPropagation();
    const current=btn.closest(".nav-item");
    document.querySelectorAll(".nav-item.open").forEach(item=>{if(item!==current)item.classList.remove("open")});
    current.classList.toggle("open");
  }));
  document.addEventListener("click",()=>document.querySelectorAll(".nav-item.open").forEach(item=>item.classList.remove("open")));
  document.querySelectorAll(".dropdown").forEach(drop=>drop.addEventListener("click",e=>e.stopPropagation()));
});
function showNotice(name){alert(name+" đang được xây dựng. Nội dung sẽ sớm được cập nhật.");}