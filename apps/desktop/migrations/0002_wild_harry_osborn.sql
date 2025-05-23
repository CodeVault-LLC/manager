CREATE TABLE `sports_leagues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`lastUpdated` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `sports_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`short_name` text NOT NULL,
	`full_name` text NOT NULL,
	`school_name` text NOT NULL,
	`league_id` integer NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `sports_leagues`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sports_game_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	`home_away` text NOT NULL,
	`win_probability` real,
	`tie_probability` real,
	FOREIGN KEY (`game_id`) REFERENCES `sports_games`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `sports_teams`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sports_games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_id` text NOT NULL,
	`start_date_time` text NOT NULL,
	`status` text NOT NULL,
	`week` text,
	`season_phase` text,
	`sport` text NOT NULL,
	`league_id` integer NOT NULL,
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
