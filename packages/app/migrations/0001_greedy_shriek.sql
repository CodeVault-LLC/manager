CREATE TABLE `news` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`news_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`summary` text,
	`category` text NOT NULL,
	`keywords` blob,
	`homepage_url` text NOT NULL,
	`publishedDate` integer NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_news_id_unique` ON `news` (`news_id`);--> statement-breakpoint
CREATE TABLE `news_thumbnail` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`news_id` text NOT NULL,
	`original_url` text NOT NULL,
	`original_width` integer NOT NULL,
	`original_height` integer NOT NULL,
	`caption` text,
	`resolutions` blob,
	FOREIGN KEY (`news_id`) REFERENCES `news`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `news_provider` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`news_id` text NOT NULL,
	`brand_id` text NOT NULL,
	`brand_name` text NOT NULL,
	`brand_url` text NOT NULL,
	`brand_logo_url` text NOT NULL,
	FOREIGN KEY (`news_id`) REFERENCES `news`(`id`) ON UPDATE cascade ON DELETE cascade
);
