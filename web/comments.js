'use strict';
// Third-party comments are optional: the article and GitHub link always remain usable.
for(const section of document.querySelectorAll('.comments')){
  const container=section.querySelector('[data-comment-options]');if(!container)continue;
  const status=section.querySelector('.comments-status'),retry=section.querySelector('.comments-retry');let mounted=false;
  const failed=()=>{status.textContent='Comments are unavailable. You can still open the discussion on GitHub.';retry.hidden=false;};
  const mount=()=>{
    if(mounted)return;mounted=true;retry.hidden=true;status.textContent='';container.replaceChildren();
    const script=document.createElement('script');script.src='https://giscus.app/client.js';script.async=true;script.crossOrigin='anonymous';
    for(const [key,value]of Object.entries(JSON.parse(container.dataset.commentOptions)))script.setAttribute('data-'+key,value);
    script.addEventListener('error',failed,{once:true});container.append(script);
  };
  retry.addEventListener('click',()=>{mounted=false;mount();});
  window.addEventListener('message',event=>{
    if(event.origin!=='https://giscus.app'||event.source!==container.querySelector('iframe')?.contentWindow||!event.data?.giscus?.error)return;
    const error=event.data.giscus.error;
    // The first visitor starts a new discussion; the SDK also repairs expired sessions itself.
    if(typeof error!=='string'||['Discussion not found','Bad credentials','Invalid state value','State has expired'].some(text=>error.includes(text)))return;
    failed();
  });
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();mount();}},{rootMargin:'200px'});observer.observe(section);}
  else mount();
}
