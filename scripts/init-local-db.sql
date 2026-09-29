CREATE TABLE IF NOT EXISTS `feeds` (
	`id` text PRIMARY KEY NOT NULL,
	`checked` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `news` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL
);
