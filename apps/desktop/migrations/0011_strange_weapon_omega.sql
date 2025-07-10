CREATE TABLE `widget_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`type` text NOT NULL,
	`settings_schema` text NOT NULL,
	`requirements` text DEFAULT '[]',
	`locales` text DEFAULT '[]'
);
--> statement-breakpoint
ALTER TABLE `widgets` ADD `definition_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `widgets` DROP COLUMN `type`;