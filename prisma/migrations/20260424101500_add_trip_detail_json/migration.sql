ALTER TABLE "Trip"
ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Untitled Trip',
ADD COLUMN "description" TEXT,
ADD COLUMN "placeInfo" JSONB,
ADD COLUMN "steps" JSONB,
ADD COLUMN "travelCars" JSONB,
ADD COLUMN "flightSegments" JSONB,
ADD COLUMN "agendaItems" JSONB,
ADD COLUMN "packingSections" JSONB;

UPDATE "Trip"
SET "title" = "destination"
WHERE "title" = 'Untitled Trip';
