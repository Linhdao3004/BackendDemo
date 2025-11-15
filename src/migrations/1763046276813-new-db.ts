import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewDb1763046276813 implements MigrationInterface {
  name = 'NewDb1763046276813';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_token" ("refreshId" uuid NOT NULL DEFAULT uuid_generate_v4(), "idUser" uuid NOT NULL, "token" character varying NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_81ae7753ba2f0f245598eb7ed52" PRIMARY KEY ("refreshId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("idProduct" uuid NOT NULL DEFAULT uuid_generate_v4(), "productName" character varying NOT NULL, "price" numeric(11,2) NOT NULL, "stock" integer NOT NULL, CONSTRAINT "PK_318999ba9feeaa49ff117c91f64" PRIMARY KEY ("idProduct"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_item" ("idOrderItem" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "idProduct" uuid, "idOrder" uuid, CONSTRAINT "PK_3eb41cdb25366914cabb4cc37aa" PRIMARY KEY ("idOrderItem"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment" ("idPayment" uuid NOT NULL DEFAULT uuid_generate_v4(), "method" character varying NOT NULL, "amount" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "transactionId" character varying, "idOrder" uuid, CONSTRAINT "REL_ff7a950b363da72e4f9d4c9008" UNIQUE ("idOrder"), CONSTRAINT "PK_eaed4b3e363f7426ad59bbe3025" PRIMARY KEY ("idPayment"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("idOrder" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalAmount" double precision NOT NULL, "idUser" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', CONSTRAINT "PK_5d1d58179295378ca899728c3ec" PRIMARY KEY ("idOrder"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("idUser" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "fistName" character varying NOT NULL, "lastName" character varying NOT NULL, "adress" character varying NOT NULL, "birthday" TIMESTAMP NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_c815460ecf7189b12a7ddd2d635" PRIMARY KEY ("idUser"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_5f21e40a354711d9ba1a3f33d7b" FOREIGN KEY ("idUser") REFERENCES "user"("idUser") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_b1d4d7070e36bc1a308a06b6d9e" FOREIGN KEY ("idProduct") REFERENCES "product"("idProduct") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_6166fc3aef3c85a3a3f2b0bf1f4" FOREIGN KEY ("idOrder") REFERENCES "order"("idOrder") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_ff7a950b363da72e4f9d4c90086" FOREIGN KEY ("idOrder") REFERENCES "order"("idOrder") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_519b5685d96f90ad1f41e9793ba" FOREIGN KEY ("idUser") REFERENCES "user"("idUser") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_519b5685d96f90ad1f41e9793ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_ff7a950b363da72e4f9d4c90086"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_6166fc3aef3c85a3a3f2b0bf1f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_b1d4d7070e36bc1a308a06b6d9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_5f21e40a354711d9ba1a3f33d7b"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(`DROP TABLE "order_item"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "refresh_token"`);
  }
}
