import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDb1764040547002 implements MigrationInterface {
    name = 'UpdateDb1764040547002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payment" ("idPayment" uuid NOT NULL DEFAULT uuid_generate_v4(), "method" character varying NOT NULL DEFAULT 'offline', "amount" numeric(11,2) NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "transactionId" character varying, "idOrder" uuid NOT NULL, CONSTRAINT "REL_ff7a950b363da72e4f9d4c9008" UNIQUE ("idOrder"), CONSTRAINT "PK_eaed4b3e363f7426ad59bbe3025" PRIMARY KEY ("idPayment"))`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_ff7a950b363da72e4f9d4c90086" FOREIGN KEY ("idOrder") REFERENCES "order"("idOrder") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_ff7a950b363da72e4f9d4c90086"`);
        await queryRunner.query(`DROP TABLE "payment"`);
    }

}
