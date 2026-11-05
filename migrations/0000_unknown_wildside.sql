CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`prospect_id` text NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`prospect_id`) REFERENCES `prospects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`id` text PRIMARY KEY NOT NULL,
	`prospect_id` text NOT NULL,
	`direction` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`from_address` text NOT NULL,
	`to_address` text NOT NULL,
	`sent_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`prospect_id`) REFERENCES `prospects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`ip` text NOT NULL,
	`attempted_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `prospects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'NEW' NOT NULL,
	`phone` text,
	`email` text,
	`address` text,
	`maps_url` text,
	`website_url` text,
	`website_status` text DEFAULT 'UNKNOWN' NOT NULL,
	`rating` real,
	`reviews_count` integer,
	`pitch_angle` text,
	`demo_page_url` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
