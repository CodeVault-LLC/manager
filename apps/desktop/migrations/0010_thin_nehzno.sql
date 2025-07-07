CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`path` text NOT NULL,
	`thumbnail` text,
	`length` integer DEFAULT 0,
	`dimensions` text,
	`category_id` text,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `files_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `files_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#0047ab' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `files_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL,
	`tag_id` text NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#0047ab' NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_widgets` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`layout` text NOT NULL,
	`static` integer DEFAULT false NOT NULL,
	`settings` text DEFAULT '{}',
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_widgets`("id", "type", "layout", "static", "settings", "active") SELECT "id", "type", "layout", "static", "settings", "active" FROM `widgets`;--> statement-breakpoint
DROP TABLE `widgets`;--> statement-breakpoint
ALTER TABLE `__new_widgets` RENAME TO `widgets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;