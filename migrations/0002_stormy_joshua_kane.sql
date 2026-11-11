CREATE TABLE IF NOT EXISTS `improvements` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`basis` text,
	`status` text DEFAULT 'proposed' NOT NULL
);
