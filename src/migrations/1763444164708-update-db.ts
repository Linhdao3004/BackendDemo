import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDb1763444164708 implements MigrationInterface {
    name = 'UpdateDb1763444164708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_ff7a950b363da72e4f9d4c90086"`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "method" SET DEFAULT 'offline'`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "amount" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "idOrder" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_ff7a950b363da72e4f9d4c90086" FOREIGN KEY ("idOrder") REFERENCES "order"("idOrder") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_ff7a950b363da72e4f9d4c90086"`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "idOrder" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "amount" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "method" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_ff7a950b363da72e4f9d4c90086" FOREIGN KEY ("idOrder") REFERENCES "order"("idOrder") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
