ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "google_id" varchar(255);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_task_idx" ON "user_roadmap_progress" USING btree ("user_id","roadmap_id","phase_index","task_index");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_google_id_unique" UNIQUE("google_id");