-- AlterTable: cada bóveda pasa a tener nombre visible.
ALTER TABLE "vaults" ADD COLUMN "name" VARCHAR(80);

-- Backfill: la bóveda única que ya existía recibe un nombre por defecto.
UPDATE "vaults" SET "name" = 'Mi bóveda' WHERE "name" IS NULL;

ALTER TABLE "vaults" ALTER COLUMN "name" SET NOT NULL;

-- DropIndex: un usuario puede tener varias bóvedas.
DROP INDEX "vaults_user_id_key";

-- CreateIndex: nombres únicos por usuario y orden por última modificación.
CREATE UNIQUE INDEX "vaults_user_id_name_key" ON "vaults"("user_id", "name");
CREATE INDEX "vaults_user_id_updated_at_idx" ON "vaults"("user_id", "updated_at" DESC);
