CREATE TABLE `game_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`player_name` text NOT NULL,
	`final_score` integer NOT NULL,
	`rank` integer NOT NULL,
	`total_turns` integer DEFAULT 0 NOT NULL,
	`total_busts` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`played_at` integer DEFAULT (unixepoch()) NOT NULL,
	`winner_name` text NOT NULL,
	`winner_score` integer NOT NULL,
	`duration_minutes` integer,
	`player_count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `turns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`player_name` text NOT NULL,
	`round` integer NOT NULL,
	`card_id` text,
	`score` integer NOT NULL,
	`busted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
