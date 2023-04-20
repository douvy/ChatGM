-- AlterTable
CREATE SEQUENCE note_id_seq;
ALTER TABLE "Note" ALTER COLUMN "id" SET DEFAULT nextval('note_id_seq');
ALTER SEQUENCE note_id_seq OWNED BY "Note"."id";
