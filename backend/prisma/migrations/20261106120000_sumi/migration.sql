-- CreateTable
CREATE TABLE "bolt_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "sumi" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bolt_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sumi" (
    "user_id" BIGINT NOT NULL,
    "credential_seed" UUID NOT NULL,
    "metered_limit_bytes" BIGINT NOT NULL DEFAULT 0,
    "metered_used_bytes" BIGINT NOT NULL DEFAULT 0,
    "metered_blocked" BOOLEAN NOT NULL DEFAULT false,
    "personal" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR(32),
    "announce" VARCHAR(120),
    "notice" VARCHAR(64),
    "proxy_extra" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sumi_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "user_sumi" ADD CONSTRAINT "user_sumi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "bolt_settings" ("id") VALUES (1) ON CONFLICT DO NOTHING;
