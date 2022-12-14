set client_min_messages to warning;
-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;
create schema "public";
CREATE TABLE "public"."users" (
	"userId" serial NOT NULL,
	"userName" TEXT NOT NULL UNIQUE,
	"hashedPassword" TEXT NOT NULL,
	"initialDeposit" integer DEFAULT 1000,
	"createdAt" timestamptz NOT NULL default now(),
	CONSTRAINT "users_pk" PRIMARY KEY ("userId")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "public"."bets" (
	"betId" serial NOT NULL,
	"gameId" TEXT NOT NULL,
	"betAmount" integer NOT NULL,
	"betType" TEXT NOT NULL,
	"createdAt" timestamptz NOT NULL default now(),
	"status" TEXT NOT NULL,
	"userId" integer NOT NULL,
	CONSTRAINT "bets_pk" PRIMARY KEY ("betId")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "public"."spreadBets" (
	"spreadBetId" serial NOT NULL,
	"betId" int NOT NULL,
	"winningTeam" TEXT NOT NULL,
	"homeTeam" TEXT NOT NULL,
	"awayTeam" TEXT NOT NULL,
	"price" integer NOT NULL,
	"points" integer NOT NULL,
	"userId" integer NOT NULL,
	"potentialWinnings" float4 NOT NULL,
	CONSTRAINT "spreadBets_pk" PRIMARY KEY ("spreadBetId")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "public"."moneylineBets" (
	"moneylineBetId" serial NOT NULL,
	"betId" int NOT NULL,
	"winningTeam" TEXT NOT NULL,
	"homeTeam" TEXT NOT NULL,
	"awayTeam" TEXT NOT NULL,
	"price" integer NOT NULL,
	"userId" integer NOT NULL,
	"potentialWinnings" float4 NOT NULL,
	CONSTRAINT "moneylineBets_pk" PRIMARY KEY ("moneylineBetId")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "public"."totals" (
	"totalsId" serial NOT NULL,
	"betId" int NOT NULL,
	"type" TEXT NOT NULL,
	"homeTeam" TEXT NOT NULL,
	"awayTeam" TEXT NOT NULL,
	"price" integer NOT NULL,
	"points" integer NOT NULL,
	"userId" integer NOT NULL,
	"potentialWinnings" float4 NOT NULL,
	CONSTRAINT "totals_pk" PRIMARY KEY ("totalsId")
) WITH (
  OIDS=FALSE
);

ALTER TABLE "bets" ADD CONSTRAINT "bets_fk0" FOREIGN KEY ("userId") REFERENCES "users"("userId");
ALTER TABLE "spreadBets" ADD CONSTRAINT "spreadBets_fk0" FOREIGN KEY ("betId") REFERENCES "bets"("betId");
ALTER TABLE "spreadBets" ADD CONSTRAINT "spreadBets_fk1" FOREIGN KEY ("userId") REFERENCES "users"("userId");
ALTER TABLE "moneylineBets" ADD CONSTRAINT "moneylineBets_fk0" FOREIGN KEY ("betId") REFERENCES "bets"("betId");
ALTER TABLE "moneylineBets" ADD CONSTRAINT "moneylineBets_fk1" FOREIGN KEY ("userId") REFERENCES "users"("userId");
ALTER TABLE "totals" ADD CONSTRAINT "totals_fk0" FOREIGN KEY ("betId") REFERENCES "bets"("betId");
ALTER TABLE "totals" ADD CONSTRAINT "totals_fk1" FOREIGN KEY ("userId") REFERENCES "users"("userId");
