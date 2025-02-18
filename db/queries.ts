import type { RequestStatusEnum } from "../models/request";
import { getDatabase } from "../utils/database";

const db = getDatabase();


export const updateRequestQuery = db.query<unknown,  {id: string, title: string, description: string, location: string, urgency: string }>(`UPDATE requests 
    SET title = $title, description = $description, location = $location, urgency = $urgency 
    WHERE id = $id`);

export const updateRequestStatusQuery = db.query<unknown, {id: string, status: RequestStatusEnum}>(`UPDATE requests SET status = $status WHERE id = $id`);

export const handleRequestAssignmentQuery = db.query<unknown, {id: string, volunteer_id: string | null, status: RequestStatusEnum}>(`UPDATE requests SET volunteer_id = $volunteer_id, status = $status WHERE id = $id`);

export const findAllRequestsQuery = db.query(`
    SELECT 
        r.*, 
        b.username as 'beneficiary.name', b.profile_img as 'beneficiary.profile_img', 
        v.username as 'volunteer.name', v.profile_img as 'volunteer.profile_img' 
    FROM requests r 
    LEFT JOIN users b ON b.id = r.beneficiary_id 
    LEFT JOIN users v ON v.id = r.volunteer_id 
    WHERE r.status IN ('open', 'in_progress')`
);

export const findRequestByIdQuery = db.query<Request, { id: string }>(`SELECT r.*, u.username as beneficiary_name, u.profile_img as beneficiary_profile_img FROM requests r JOIN users u ON u.id = r.beneficiary_id  WHERE r.id = $id`);
        
export const findRequestsByVolunteerIdQuery = db.query<Request, { volunteer_id: string }>(`SELECT * FROM requests WHERE volunteer_id = $volunteer_id  AND status <> 'done' ORDER BY created_at DESC` );
        
export const findRequestsByBeneficiaryIdQuery = db.query<Request, { beneficiary_id: string }>(`SELECT * FROM requests WHERE beneficiary_id = $beneficiary_id AND status <> 'done' ORDER BY created_at DESC`);      

export const findDoneRequestsOfBeneficiaryQuery= db.query<Request, { beneficiary_id: string }>(`SELECT * FROM requests WHERE beneficiary_id = $beneficiary_id  AND status = 'done'  ORDER BY created_at DESC`)
export const findDoneRequestsOfVolunteerQuery = db.query<Request, { volunteer_id: string }>(`SELECT * FROM requests WHERE volunteer_id = $volunteer_id  AND status = 'done'  ORDER BY created_at DESC`)

export const updateUserQuery = db.query<unknown, { username: string; email: string; phone: string; profileImg: string; id: string }>(
    `UPDATE users SET username = $username, email = $email, phone = $phone, profile_img = $profileImg WHERE id = $id`
);

export const updateVolunteerQuery = db.query<unknown, { skills: string; availability: string; id: string }>(
 `UPDATE volunteers SET skills = $skills, availability = $availability WHERE user_id = $id`
);

export const updateBeneficiaryQuery = db.query<unknown, { needs: string; location: string; id: string }>(
    `UPDATE beneficiaries SET needs = $needs, location = $location WHERE user_id = $id`
);