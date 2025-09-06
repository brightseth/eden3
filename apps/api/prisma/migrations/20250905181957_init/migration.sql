-- CreateTable
CREATE TABLE "public"."agents" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archetype" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "personality" TEXT,
    "capabilities" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "status" TEXT NOT NULL DEFAULT 'ONBOARDING',
    "trainer" TEXT,
    "practice" TEXT,
    "cadence" TEXT,
    "k_streak" INTEGER NOT NULL DEFAULT 0,
    "k_quality" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "k_mentions" INTEGER NOT NULL DEFAULT 0,
    "k_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sources" TEXT DEFAULT '["eden3-native"]',
    "external_ids" TEXT,
    "last_sync_at" TIMESTAMP(3),
    "profile" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agent_kpis" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "total_works" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_training_sessions" INTEGER NOT NULL DEFAULT 0,
    "social_mentions" INTEGER NOT NULL DEFAULT 0,
    "total_collaborations" INTEGER NOT NULL DEFAULT 0,
    "last_activity" TIMESTAMP(3),
    "last_training" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "metadata" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."works" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "medium" TEXT NOT NULL,
    "content_url" TEXT,
    "thumbnail_url" TEXT,
    "file_size" INTEGER,
    "ipfs_hash" TEXT,
    "ai_model" TEXT,
    "prompt_used" TEXT,
    "generation_time" DOUBLE PRECISION,
    "tags" TEXT NOT NULL,
    "quality" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "sale_price" DOUBLE PRECISION,
    "currency" TEXT,
    "sold_at" TIMESTAMP(3),
    "buyer_id" TEXT,
    "platform" TEXT,
    "gross_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "work_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "buyer_id" TEXT,
    "platform" TEXT,
    "royalty_amount" DOUBLE PRECISION,
    "tx_hash" TEXT,
    "block_number" INTEGER,
    "gas_used" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_sessions" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "trainer_id" TEXT,
    "session_type" TEXT NOT NULL,
    "duration" INTEGER,
    "feedback_score" DOUBLE PRECISION,
    "improvements" TEXT NOT NULL,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mentions" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT,
    "sentiment" TEXT,
    "reach" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collaborations" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "partner_agent_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "work_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collaborations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quality_evaluations" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "evaluator_id" TEXT,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_metrics" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "creation_count" INTEGER NOT NULL DEFAULT 0,
    "sale_count" INTEGER NOT NULL DEFAULT 0,
    "training_count" INTEGER NOT NULL DEFAULT 0,
    "mention_count" INTEGER NOT NULL DEFAULT 0,
    "collaboration_count" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agent_metrics" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "quality_score" DOUBLE PRECISION,
    "engagement_rate" DOUBLE PRECISION,
    "response_time" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_slug_key" ON "public"."agents"("slug");

-- CreateIndex
CREATE INDEX "agents_slug_idx" ON "public"."agents"("slug");

-- CreateIndex
CREATE INDEX "agents_status_idx" ON "public"."agents"("status");

-- CreateIndex
CREATE INDEX "agents_trainer_idx" ON "public"."agents"("trainer");

-- CreateIndex
CREATE INDEX "agents_type_idx" ON "public"."agents"("type");

-- CreateIndex
CREATE INDEX "agents_k_streak_idx" ON "public"."agents"("k_streak");

-- CreateIndex
CREATE INDEX "agents_k_quality_idx" ON "public"."agents"("k_quality");

-- CreateIndex
CREATE INDEX "agents_k_revenue_idx" ON "public"."agents"("k_revenue");

-- CreateIndex
CREATE INDEX "agents_created_at_idx" ON "public"."agents"("created_at");

-- CreateIndex
CREATE INDEX "agents_last_sync_at_idx" ON "public"."agents"("last_sync_at");

-- CreateIndex
CREATE UNIQUE INDEX "agent_kpis_agent_id_key" ON "public"."agent_kpis"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_event_id_key" ON "public"."events"("event_id");

-- CreateIndex
CREATE INDEX "events_event_id_idx" ON "public"."events"("event_id");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "public"."events"("type");

-- CreateIndex
CREATE INDEX "events_agent_id_idx" ON "public"."events"("agent_id");

-- CreateIndex
CREATE INDEX "events_agent_id_type_idx" ON "public"."events"("agent_id", "type");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "public"."events"("status");

-- CreateIndex
CREATE INDEX "events_timestamp_idx" ON "public"."events"("timestamp");

-- CreateIndex
CREATE INDEX "events_created_at_idx" ON "public"."events"("created_at");

-- CreateIndex
CREATE INDEX "works_agent_id_idx" ON "public"."works"("agent_id");

-- CreateIndex
CREATE INDEX "works_medium_idx" ON "public"."works"("medium");

-- CreateIndex
CREATE INDEX "works_status_idx" ON "public"."works"("status");

-- CreateIndex
CREATE INDEX "works_visibility_idx" ON "public"."works"("visibility");

-- CreateIndex
CREATE INDEX "works_quality_idx" ON "public"."works"("quality");

-- CreateIndex
CREATE INDEX "works_sale_price_idx" ON "public"."works"("sale_price");

-- CreateIndex
CREATE INDEX "works_sold_at_idx" ON "public"."works"("sold_at");

-- CreateIndex
CREATE INDEX "works_created_at_idx" ON "public"."works"("created_at");

-- CreateIndex
CREATE INDEX "works_published_at_idx" ON "public"."works"("published_at");

-- CreateIndex
CREATE INDEX "works_agent_id_status_idx" ON "public"."works"("agent_id", "status");

-- CreateIndex
CREATE INDEX "works_agent_id_created_at_idx" ON "public"."works"("agent_id", "created_at");

-- CreateIndex
CREATE INDEX "transactions_work_id_idx" ON "public"."transactions"("work_id");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "public"."transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_timestamp_idx" ON "public"."transactions"("timestamp");

-- CreateIndex
CREATE INDEX "training_sessions_agent_id_idx" ON "public"."training_sessions"("agent_id");

-- CreateIndex
CREATE INDEX "training_sessions_trainer_id_idx" ON "public"."training_sessions"("trainer_id");

-- CreateIndex
CREATE INDEX "training_sessions_timestamp_idx" ON "public"."training_sessions"("timestamp");

-- CreateIndex
CREATE INDEX "mentions_agent_id_idx" ON "public"."mentions"("agent_id");

-- CreateIndex
CREATE INDEX "mentions_platform_idx" ON "public"."mentions"("platform");

-- CreateIndex
CREATE INDEX "mentions_timestamp_idx" ON "public"."mentions"("timestamp");

-- CreateIndex
CREATE INDEX "collaborations_agent_id_idx" ON "public"."collaborations"("agent_id");

-- CreateIndex
CREATE INDEX "collaborations_partner_agent_id_idx" ON "public"."collaborations"("partner_agent_id");

-- CreateIndex
CREATE INDEX "collaborations_timestamp_idx" ON "public"."collaborations"("timestamp");

-- CreateIndex
CREATE INDEX "quality_evaluations_agent_id_idx" ON "public"."quality_evaluations"("agent_id");

-- CreateIndex
CREATE INDEX "quality_evaluations_evaluator_id_idx" ON "public"."quality_evaluations"("evaluator_id");

-- CreateIndex
CREATE INDEX "quality_evaluations_timestamp_idx" ON "public"."quality_evaluations"("timestamp");

-- CreateIndex
CREATE INDEX "daily_metrics_agent_id_idx" ON "public"."daily_metrics"("agent_id");

-- CreateIndex
CREATE INDEX "daily_metrics_date_idx" ON "public"."daily_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_metrics_agent_id_date_key" ON "public"."daily_metrics"("agent_id", "date");

-- CreateIndex
CREATE INDEX "agent_metrics_agent_id_idx" ON "public"."agent_metrics"("agent_id");

-- CreateIndex
CREATE INDEX "agent_metrics_date_idx" ON "public"."agent_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "agent_metrics_agent_id_date_key" ON "public"."agent_metrics"("agent_id", "date");

-- AddForeignKey
ALTER TABLE "public"."agent_kpis" ADD CONSTRAINT "agent_kpis_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."works" ADD CONSTRAINT "works_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_sessions" ADD CONSTRAINT "training_sessions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mentions" ADD CONSTRAINT "mentions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collaborations" ADD CONSTRAINT "collaborations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quality_evaluations" ADD CONSTRAINT "quality_evaluations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
