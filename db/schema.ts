import {sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const news=sqliteTable('news',{id:text('id').primaryKey(),payload:text('payload').notNull()});
export const feeds=sqliteTable('feeds',{id:text('id').primaryKey(),checked:text('checked').notNull(),status:text('status').notNull()});
