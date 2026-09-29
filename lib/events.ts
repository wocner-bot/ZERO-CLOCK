export type Event = { id:string; date:string; title:string; summary:string; source:string; url:string; category:string; delta:number; reason:string; auto?:boolean };
export const checkedAt='2026-09-29T19:49:00Z';
export const seed:Event[]=[
['sol','2026-09-29','GPT-6.1 Sol: больше возможностей, ниже стоимость','OpenAI представила новую модель для программирования и профессиональных задач.','OpenAI','https://openai.com/ru-RU/index/introducing-gpt-6-1-sol/','Модели',2,'Доступность сильных моделей ускоряет внедрение; это сценарная оценка, а не доказательство потери контроля.'],
['sol-safety','2026-09-29','GPT-6.1 Sol: опубликована оценка опасных возможностей','В собственной классификации OpenAI модель достигает Critical для кибервозможностей и High для биологических и химических возможностей.','OpenAI Safety','https://deploymentsafety.openai.com/gpt-6-1-sol','Безопасность',2,'Оценивается дополнительная информация об опасных возможностях, а не повторно факт релиза. Защитные меры существуют; реальный ущерб этим не установлен.'],
['sonnet','2026-09-28','Claude Sonnet 5.5: агентная работа становится доступнее','Anthropic сообщает о росте скорости и снижении затрат на типичные задачи относительно Sonnet 5.','Anthropic','https://www.anthropic.com/claude-sonnet-5-5','Модели',1.5,'Меньшая стоимость и рост агентных возможностей повышают доступность автоматизации.'],
['cases','2026-09-28','OpenAI предлагает safety cases для обучения моделей','Опубликованы рекомендации по изоляции, мониторингу и расследованию несогласованного поведения. Часть практик ещё внедряется.','OpenAI','https://openai.com/index/towards-safety-cases-for-frontier-ai-training/','Безопасность',-1,'Прозрачные процедуры контроля помогают сдерживанию; вес ограничен, поскольку это рекомендации, а не доказанный результат.'],
['avatar','2026-09-24','Gemini 3.8 Live получает Live Avatar','Google показала взаимодействие с одновременной обработкой звука и изображения.','Google','https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-with-live-avatar/','Модели',0.5,'Расширение мультимодальности; прямого свидетельства опасной автономности нет.'],
['opus','2026-09-22','Anthropic представляет Claude Opus 5.5','Компания анонсировала новую модель для сложной профессиональной работы.','Anthropic','https://www.anthropic.com/claude-opus-5-5','Модели',1.5,'Рост возможностей агентной работы увеличивает сценарный индекс.'],
['life','2026-09-17','Проверка доступа к чувствительным исследованиям','Anthropic представила Life Sciences Verification Program.','Anthropic','https://www.anthropic.com/news/life-sciences-verification-program','Безопасность',-1,'Проверка доступа может уменьшать злоупотребления; эффективность пока не установлена независимо.'],
['live','2026-09-15','Gemini 3.8 Live: голосовые агенты с инструментами','Google представила Live и Live Extended Thinking для диалога и выполнения задач. Публикация обновлена 17 сентября.','Google','https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-live-gemini-3-8-live-extended-thinking/','Модели',1,'Инструменты и работа в фоне расширяют область делегируемых AI действий.'],
['misuse','2026-09-10','Anthropic публикует отчёт о злоупотреблениях AI','Компания описала выявленные и пресечённые попытки вредоносного использования Claude.','Anthropic','https://www.anthropic.com/threat-intelligence-report-september-2026','Инциденты',1,'Отчёт подтверждает злоупотребления, но также их пресечение. Умеренный вес учитывает оба фактора.'],
['fable','2026-09-01','Claude Fable 5.1 и Mythos 5.1','Anthropic представила новые модели для программирования, исследований и интеллектуальной работы.','Anthropic','https://www.anthropic.com/claude-fable-and-mythos-5-1','Модели',2,'Дальнейший рост исследовательских возможностей; оценки производителя не равны независимой проверке.'],
['eu-enforce','2026-08-02','ЕС начинает новый этап применения AI Act','Вступают в применение новые требования прозрачности и механизмы надзора. Это не означает, что все положения закона уже применяются.','Еврокомиссия','https://digital-strategy.ec.europa.eu/en/news/commission-starts-enforcing-ai-act-rules-and-new-transparency-requirements-2-august','Законы',-2,'Обязательная прозрачность и надзор усиливают подотчётность.'],
['omnibus','2026-07-27','AI Omnibus меняет сроки регулирования','Для систем из Annex III срок перенесён на 2 декабря 2027 года, для ряда систем в продуктах из Annex I — на 2 августа 2028 года.','Еврокомиссия','https://digital-strategy.ec.europa.eu/en/news/ai-omnibus-enters-force','Законы',1,'Отсрочка части обязательств увеличивает переходный период. Другие защитные положения сохраняются.']
].map(([id,date,title,summary,source,url,category,delta,reason])=>({id,date,title,summary,source,url,category,delta,reason})) as Event[];
export const history=[
{year:'1943',title:'Математический нейрон',text:'Маккаллок и Питтс описывают логическую модель нервной активности.',url:'https://doi.org/10.1007/BF02478259',source:'Оригинальная статья'},
{year:'1950',title:'Может ли машина мыслить?',text:'Алан Тьюринг предлагает игру в имитацию как способ обсуждать машинный интеллект.',url:'https://doi.org/10.1093/mind/LIX.236.433',source:'Mind · Алан Тьюринг'},
{year:'1956',title:'Logic Theorist и рождение AI',text:'Один из ранних работающих прототипов доказывает теоремы. Дартмутский семинар формирует новое направление исследований.',url:'https://archive.computerhistory.org/resources/access/text/2020/05/102781122-05-01-acc.pdf',source:'Computer History Museum'},
{year:'1956',title:'Дартмутский семинар',text:'Исследователи объединяются вокруг идеи искусственного интеллекта как научной дисциплины.',url:'https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth',source:'Dartmouth'},
{year:'1958',title:'Перцептрон',text:'Фрэнк Розенблатт описывает обучаемую модель распознавания, один из предшественников современных нейросетей.',url:'https://doi.org/10.1037/h0042519',source:'Psychological Review'},
{year:'1966',title:'ELIZA',text:'Программа Джозефа Вейценбаума демонстрирует диалог по текстовым шаблонам, без понимания в человеческом смысле.',url:'https://doi.org/10.1145/365153.365168',source:'Communications of the ACM'},
{year:'1997',title:'Deep Blue побеждает Каспарова',text:'Специализированная система IBM выигрывает матч у действующего чемпиона мира по шахматам.',url:'https://www.ibm.com/new/product-blog/from-checkers-to-chess-a-brief-history-of-ibm-ai',source:'IBM'},
{year:'2012',title:'AlexNet и глубокое обучение',text:'Глубокая свёрточная сеть показывает резкий прогресс в классификации ImageNet.',url:'https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks',source:'NeurIPS'},
{year:'2016',title:'AlphaGo: 4 : 1',text:'Система DeepMind побеждает Ли Седоля. Прорыв в сложной игре не означает общего интеллекта.',url:'https://deepmind.google/research/alphago/',source:'Google DeepMind'},
{year:'2017',title:'Архитектура Transformer',text:'Attention Is All You Need предлагает архитектуру, ставшую основой многих современных языковых моделей.',url:'https://arxiv.org/abs/1706.03762',source:'Авторы исследования · arXiv'},
{year:'2022',title:'ChatGPT выходит в публичный доступ',text:'30 ноября начинается массовое знакомство с разговорными генеративными моделями.',url:'https://openai.com/index/chatgpt/',source:'OpenAI'},
{year:'2024',title:'Принят AI Act',text:'Европейский союз принимает риск-ориентированную систему регулирования AI с поэтапным применением.',url:'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',source:'Официальный журнал ЕС'},
{year:'2026',title:'От ответов к действиям',text:'Новые модели используют инструменты и выполняют многошаговые задачи. Надзор и проверка безопасности развиваются одновременно.',url:'https://www.anthropic.com/news/claude-sonnet-5',source:'Anthropic'}
];
export function score(events:Event[]){const manual=events.filter(e=>!e.auto).reduce((n,e)=>n+e.delta,0); const automatic=Math.max(-5,Math.min(5,events.filter(e=>e.auto).reduce((n,e)=>n+e.delta,0)));return Math.max(0,Math.min(99,55+manual+automatic));}
export function targetDate(index:number){return Date.parse('2026-09-29T00:00:00Z')+(100-index)*30*86400000;}

// Attribute the capped index change in a deterministic chronological replay.
// The sum of all contributions always reconciles with score(events) - 55.
export function contributions(events:Event[]):Record<string,number>{
 const ordered=[...events].sort((a,b)=>a.date.localeCompare(b.date)||Number(!!a.auto)-Number(!!b.auto)||(a.id<b.id?-1:a.id>b.id?1:0));
 let manual=0,automatic=0,previous=55;
 const result:Record<string,number>={};
 for(const event of ordered){
  if(event.auto)automatic+=event.delta;else manual+=event.delta;
  const next=Math.max(0,Math.min(99,55+manual+Math.max(-5,Math.min(5,automatic))));
  result[event.id]=Math.round((next-previous)*1000)/1000;
  previous=next;
 }
 return result;
}
export function shiftText(points:number){const days=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(Math.abs(points*30));return points>0?`Приближает на ${days} дн.`:points<0?`Отдаляет на ${days} дн.`:'Без изменения';}
export function periodEvents(events:Event[],end:string){const start=new Date(Date.parse(end+'T00:00:00Z')-6*86400000).toISOString().slice(0,10);return {start,end,events:events.filter(e=>e.date>=start&&e.date<=end)};}
