import {seed,type Event} from './events';
export const feedSources=[{id:'OpenAI',url:'https://openai.com/news/rss.xml',domain:'openai.com'},{id:'Google AI',url:'https://blog.google/technology/ai/rss/',domain:'blog.google'},{id:'Anthropic',url:'https://www.anthropic.com/news',domain:'anthropic.com'},{id:'Еврокомиссия',url:'https://digital-strategy.ec.europa.eu/en/news',domain:'digital-strategy.ec.europa.eu'}];
export function clean(s:string){return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,' ').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>{const v=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):parseInt(n);return v>=0&&v<=0x10ffff?String.fromCodePoint(v):''}).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();}
export function canonical(url:string){const u=new URL(url);return u.hostname.replace(/^www\./,'')+u.pathname.replace(/^\/[a-z]{2}-[A-Z]{2}\//,'/').replace(/\/$/,'');}
export function signal(title:string){
const safety=/safeguard|safety case|verification program|protecting|countering misuse|security improvement/i.test(title);
const capability=/introducing|launch(?:ing|es)?|releasing|new model/i.test(title)&&/gpt|gemini|claude|model|agent/i.test(title);
if(safety&&capability)return {delta:0,category:'Безопасность',reason:'Смешанные сигналы в заголовке. Автоматика оставляет нулевой вес до редакционной проверки.'};
if(safety)return {delta:-0.5,category:'Безопасность',reason:'Автоправило обнаружило в заголовке заявленную защитную меру. Полный текст и её эффективность не проверены. Низкая уверенность.'};
if(capability)return {delta:0.5,category:'Модели',reason:'Автоправило обнаружило анонс модели или агента. Рост опасных возможностей не доказан; это слабый сценарный сигнал. Низкая уверенность.'};
return {delta:0,category:'Исследования',reason:'Заголовка недостаточно для вывода о направлении влияния. Часы не меняются.'};
}
export function parseFeed(xml:string,source:typeof feedSources[number],now=Date.now()):Event[]{
if(!/<rss[\s>]|<feed[\s>]/i.test(xml))throw Error('Invalid feed');
const blocks=xml.match(/<item[\s>][\s\S]*?<\/item>/gi)||xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi)||[];
return blocks.slice(0,100).flatMap(block=>{const tag=(name:string)=>clean(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i').exec(block)?.[1]??'');const title=tag('title').slice(0,300),url=tag('link')||/<link[^>]*href=["']([^"']+)/i.exec(block)?.[1]||'',rawDate=tag('pubDate')||tag('published')||tag('updated'),time=Date.parse(rawDate);try{const u=new URL(url);if(u.protocol!=='https:'||!(u.hostname===source.domain||u.hostname.endsWith('.'+source.domain)))return [];}catch{return []}
if(!title||!Number.isFinite(time)||time>now||time<Date.parse('2026-09-29T00:00:00Z'))return [];
const key=canonical(url);if(seed.some(e=>canonical(e.url)===key))return [];
if(source.id==='Google AI'&&!/\bAI\b|artificial intelligence|gemini|deepmind|model|agent/i.test(title))return [];
const s=signal(title);return [{id:key,date:new Date(time).toISOString().slice(0,10),title,summary:'Новая публикация из официальной RSS-ленты. Заголовок сохранён на языке источника; полный текст доступен по ссылке.',source:source.id,url,auto:true,...s}];});
}
export function dedupe(events:Event[]){const seen=new Set<string>();return events.filter(e=>{const key=canonical(e.url);const title=e.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');if(seen.has(key)||seen.has(title))return false;seen.add(key);seen.add(title);return true;});}

export function parseNewsPage(html:string,source:typeof feedSources[number],now=Date.now()):Event[]{
const blocks=source.id==='Anthropic'?(html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi)||[]).filter(b=>/<time\b/.test(b)):(html.match(/<article\b[^>]*>[\s\S]*?<\/article>/gi)||[]);
if(!blocks.length)throw Error('News page format changed');
const items=blocks.flatMap(b=>{const href=/href=["']([^"']+)["']/.exec(b)?.[1];const title=source.id==='Anthropic'?clean(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/.exec(b)?.[1]||/<span[^>]*class=["'][^"']*__title[^"']*["'][^>]*>([\s\S]*?)<\/span>/.exec(b)?.[1]||''):clean(/data-ecl-title-link[^>]*>([\s\S]*?)<\/a>/.exec(b)?.[1]||'');const raw=source.id==='Anthropic'?clean(/<time[^>]*>([\s\S]*?)<\/time>/.exec(b)?.[1]||''):(clean(b).match(/\b\d{1,2} [A-Z][a-z]+ 20\d{2}\b/)?.[0]||'');if(!href||!title||!raw)return [];
const url=new URL(href,source.url).toString();const safe=(x:string)=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');return [`<item><title>${safe(title)}</title><link>${safe(url)}</link><pubDate>${safe(raw+' UTC')}</pubDate></item>`];});
const parsed=parseFeed('<rss>'+items.join('')+'</rss>',source,now);
return parsed.filter(e=>source.id!=='Еврокомиссия'||/\bAI\b|artificial intelligence/i.test(e.title)).map(e=>{e.summary='Новая публикация на официальном сайте. Заголовок сохранён на языке источника; полный текст доступен по ссылке.';if(source.id==='Еврокомиссия'){e.category='Законы';e.delta=/draft|propos|consult/i.test(e.title)?0:/enters into force|starts enforcing|begin enforcement/i.test(e.title)?-.5:/delay|postpon|extend.*timeline|extend.*deadline/i.test(e.title)?.5:0;e.reason='Автооценка стадии регулирования по заголовку. Проекты и консультации получают нулевой вес. Юридические последствия требуют проверки полного текста.';}return e;});
}
