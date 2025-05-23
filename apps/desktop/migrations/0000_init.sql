CREATE TABLE `browsers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`browser_id` text NOT NULL,
	`path` text NOT NULL,
	`synced` integer,
	`syncedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
