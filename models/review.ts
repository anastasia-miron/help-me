import { v4 } from "uuid";
import { getDatabase } from "../utils/database";

const db = getDatabase();

class Review {
    public id: string = v4();
    public request_id: string = "";
    public from_id: string = "";
    public to_id: string = "";
    private _rating: number = 0;
    public comment: string = "";
    public created_at: Date = new Date();

    set rating(value: number) {
        if (!Number.isInteger(value) || value < 1 || value > 5) {
            throw new Error("Rating must be an integer between 1 and 5.");
        }
        this._rating = value;
    }

    get rating(): number {
        return this._rating;
    }

    create() {
        db.query(`INSERT INTO reviews (id, request_id, from_id, to_id, rating, comment, created_at) 
                  VALUES ($id, $request_id, $from_id, $to_id, $rating, $comment, $created_at)`)
        .run({
            "id": this.id,
            "request_id": this.request_id,
            "from_id": this.from_id,
            "to_id": this.to_id,
            "rating": this.rating,
            "comment": this.comment,
            "created_at": this.created_at.toISOString()
        });
    }

    update() {
      db.query(`UPDATE reviews SET rating = $rating, comment = $comment, updated_at = $updated_at WHERE id = $id`)
      .run({
        "id": this.id,
        "rating": this.rating,
        "comment": this.comment
    });


}
     static getByUserId(to_id: string) {
        return db.query<Review, { to_id: string }>(
            `SELECT * FROM reviews WHERE to_id = $to_id`
        ).as(Review).all({ to_id });
    }

    static getByReviewerId(from_id: string) {
        return db.query<Review, { from_id: string }>(
            `SELECT * FROM reviews WHERE from_id = $from_id`
        ).as(Review).all({ from_id });
    }
    static findById(id: string) {
        return db.query<Review, { id: string }>(
            `SELECT * FROM reviews WHERE id = $id`
        ).as(Review).get({ id });
    }
}

export default Review;
