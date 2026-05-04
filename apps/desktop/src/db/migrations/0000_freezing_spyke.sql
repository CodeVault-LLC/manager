CREATE TABLE `integration_credentials` (
	`kind` text PRIMARY KEY NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`token_expires_at` integer,
	`scopes` text DEFAULT '[]' NOT NULL,
	`connected_account` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `integration_state` (
	`kind` text PRIMARY KEY NOT NULL,
	`availability` text DEFAULT 'unknown' NOT NULL,
	`unavailable_reason` text,
	`driver` text,
	`last_checked_at` integer
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
