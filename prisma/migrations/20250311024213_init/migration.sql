-- CreateTable
CREATE TABLE "MarketAnalysis" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sentimentScore" DOUBLE PRECISION NOT NULL,
    "safetyScore" DOUBLE PRECISION NOT NULL,
    "marketTrend" TEXT NOT NULL,
    "volatilityLevel" DOUBLE PRECISION NOT NULL,
    "topGainers" JSONB,
    "topLosers" JSONB,
    "keyEvents" TEXT,
    "tradingSuggestions" TEXT,
    "sectors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketAnalysis_date_key" ON "MarketAnalysis"("date");
