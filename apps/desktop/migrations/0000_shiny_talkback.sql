CREATE TABLE `browsers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`browser_id` text NOT NULL,
	`path` text NOT NULL,
	`synced` integer,
	`syncedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `sports_leagues` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`lastUpdated` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `sports_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`short_name` text NOT NULL,
	`full_name` text NOT NULL,
	`school_name` text NOT NULL,
	`league_id` text NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `sports_leagues`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sports_game_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`team_id` text NOT NULL,
	`home_away` text NOT NULL,
	`win_probability` real,
	`tie_probability` real,
	FOREIGN KEY (`game_id`) REFERENCES `sports_games`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `sports_teams`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sports_games` (
	`id` text PRIMARY KEY NOT NULL,
	`external_id` text NOT NULL,
	`start_date_time` text NOT NULL,
	`status` text NOT NULL,
	`week` text,
	`season_phase` text,
	`sport` text NOT NULL,
	`league_id` text NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `sports_leagues`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `extensions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`extension_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`slug` text NOT NULL,
	`repository_url` text,
	`manifest_url` text,
	`installed_version` text NOT NULL,
	`installed_at` integer NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`user_config_json` text,
	`last_checked_at` integer,
	`latest_version_remote` text
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `widget_instances` (
	`id` text PRIMARY KEY NOT NULL,
	`definition_id` text NOT NULL,
	`layout` text NOT NULL,
	`static` integer DEFAULT false NOT NULL,
	`settings` text DEFAULT '{}'
);
--> statement-breakpoint
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
