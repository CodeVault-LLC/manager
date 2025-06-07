PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sports_leagues` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`lastUpdated` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
INSERT INTO `__new_sports_leagues`("id", "name", "lastUpdated") SELECT "id", "name", "lastUpdated" FROM `sports_leagues`;--> statement-breakpoint
DROP TABLE `sports_leagues`;--> statement-breakpoint
ALTER TABLE `__new_sports_leagues` RENAME TO `sports_leagues`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_sports_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`short_name` text NOT NULL,
	`full_name` text NOT NULL,
	`school_name` text NOT NULL,
	`league_id` text NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `sports_leagues`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sports_teams`("id", "short_name", "full_name", "school_name", "league_id") SELECT "id", "short_name", "full_name", "school_name", "league_id" FROM `sports_teams`;--> statement-breakpoint
DROP TABLE `sports_teams`;--> statement-breakpoint
ALTER TABLE `__new_sports_teams` RENAME TO `sports_teams`;--> statement-breakpoint
CREATE TABLE `__new_sports_game_participants` (
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
INSERT INTO `__new_sports_game_participants`("id", "game_id", "team_id", "home_away", "win_probability", "tie_probability") SELECT "id", "game_id", "team_id", "home_away", "win_probability", "tie_probability" FROM `sports_game_participants`;--> statement-breakpoint
DROP TABLE `sports_game_participants`;--> statement-breakpoint
ALTER TABLE `__new_sports_game_participants` RENAME TO `sports_game_participants`;--> statement-breakpoint
CREATE TABLE `__new_sports_games` (
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
INSERT INTO `__new_sports_games`("id", "external_id", "start_date_time", "status", "week", "season_phase", "sport", "league_id") SELECT "id", "external_id", "start_date_time", "status", "week", "season_phase", "sport", "league_id" FROM `sports_games`;--> statement-breakpoint
DROP TABLE `sports_games`;--> statement-breakpoint
ALTER TABLE `__new_sports_games` RENAME TO `sports_games`;