import { getDatabase } from "../utils/database";
import { v4 as uuidv4 } from "uuid";

const db = getDatabase();

export enum TokenStatusEnum {
    ACTIVE = 'active',
    USED = 'used',
    EXPIRED = 'expired',
    OUTDATED = 'outdated'
}

export enum TokenTypeEnum {
    VERIFICATION = "verification",
    PASSWORD = "password"
}




class Token {
    public id = uuidv4();
    public user_id: string = "";
    public token: string = this.generateRandomToken(); 
    public created_at: string = new Date().toISOString();
    public status: TokenStatusEnum = TokenStatusEnum.ACTIVE;
    public type: TokenTypeEnum = TokenTypeEnum.VERIFICATION;
    // TO DO: look if i will need here that user is first time on the page flag


    private generateRandomToken() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            token: this.token,
            created_at: this.created_at,
            status: this.status,
            type: this.type
        };
    }

    create() {
        db.query<unknown, { user_id: string, token: string, created_at: string, status:TokenStatusEnum, type:TokenTypeEnum }>(
            `INSERT INTO tokens (user_id, token, created_at, status, type) 
             VALUES ($user_id, $token, $created_at, $status, $type)`
        ).run({
            "user_id": this.user_id,
            "token": this.token,
            "created_at": this.created_at,
            "status": this.status,
            "type": this.type
        });
    }
    update() {
        db.query(
        `UPDATE tokens 
         SET status = $status 
         WHERE token = $token`
    ).run({
        "status": this.status,
        "token": this.token
    });

}

    static findByToken(token: string) {
        return db.query(`SELECT * FROM tokens WHERE token = $token AND status = 'active'`).as(Token).get({ token });
    }

    

    delete() {
        db.query(`DELETE FROM tokens WHERE token = $token`).run({ token: this.token });
    }
}

export default Token;
