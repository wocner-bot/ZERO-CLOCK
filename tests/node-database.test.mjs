import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openDatabase} from '../lib/db-node.ts';

test('news survive reopening the database and duplicate IDs are ignored',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'clock-db-'));
 try{
  const path=join(directory,'nested','news.sqlite');
  let db=openDatabase(path);
  await db.batch([db.prepare('INSERT OR IGNORE INTO news(id,payload) VALUES (?,?)').bind('a','first'),db.prepare('INSERT OR IGNORE INTO news(id,payload) VALUES (?,?)').bind('a','second')]);
  db.close();db=openDatabase(path);
  assert.deepEqual((await db.prepare('SELECT payload FROM news').all()).results.map(row=>row.payload),['first']);
  db.close();
 }finally{rmSync(directory,{recursive:true,force:true});}
});

test('refresh leases allow only one request in the fifteen-minute window',async()=>{
 const db=openDatabase(':memory:');
 try{
  const sql="INSERT INTO feeds(id,checked,status) VALUES (?,?,'Проверка') ON CONFLICT(id) DO UPDATE SET checked=excluded.checked,status=excluded.status WHERE feeds.checked < ?";
  const attempt=()=>db.prepare(sql).bind('OpenAI','2026-09-30T12:00:00Z','2026-09-30T11:45:00Z').run();
  const first=await attempt(),second=await attempt();
  assert.equal(first.meta.changes,1);assert.equal(second.meta.changes,0);
 }finally{db.close();}
});

test('failed batches roll back all writes',async()=>{
 const db=openDatabase(':memory:');
 try{
  await assert.rejects(db.batch([db.prepare('INSERT INTO news(id,payload) VALUES (?,?)').bind('a','first'),db.prepare('INSERT INTO news(id,payload) VALUES (?,?)').bind('a','duplicate')]));
  assert.equal((await db.prepare('SELECT * FROM news').all()).results.length,0);
 }finally{db.close();}
});
