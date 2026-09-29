import test from 'node:test';
import assert from 'node:assert/strict';
import {seed,score,targetDate,contributions,periodEvents} from '../lib/events.ts';
const event=(id,delta,auto=true,date='2026-09-30')=>({...seed[0],id,delta,auto,date});
test('an extra automatic signal at the cap moves neither the clock nor its card',()=>{
 const initial=[...seed,...Array.from({length:10},(_,i)=>event(`auto-${i}`,0.5))];
 const events=[...initial,event('zz-extra',.5)];
 assert.equal(targetDate(score(events)),targetDate(score(initial)));
 assert.equal(contributions(events)['zz-extra'],0);
});
test('partial cap is reflected in the card',()=>{
 const events=[event('a',4.75),event('b',.5)];
 assert.equal(contributions(events).b,.25);
});
test('opposing signals and the overall bound reconcile to the total',()=>{
 for(const events of [[...seed,event('x',6),event('y',-2)],[event('a',43.75,false),event('b',1,false)],[event('a',-60,false),event('b',8,false)]]){
 const sum=Object.values(contributions(events)).reduce((a,b)=>a+b,0);
 assert.equal(sum,score(events)-55);
 }
});
test('attribution is deterministic regardless of feed order',()=>{
 const events=[...seed,event('b',.5),event('a',5),event('c',-1)];
 assert.deepEqual(contributions(events),contributions([...events].reverse()));
});
test('week covers exactly seven UTC calendar dates and excludes future events',()=>{
 const dates=['2026-09-22','2026-09-23','2026-09-29','2026-09-30'];
 const result=periodEvents(dates.map((d,i)=>event(String(i),1,false,d)),'2026-09-29');
 assert.equal(result.start,'2026-09-23');assert.deepEqual(result.events.map(e=>e.date),['2026-09-23','2026-09-29']);
});
