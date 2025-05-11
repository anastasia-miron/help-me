import type { RequestStatusEnum } from "../models/request";
import type User from "../models/user";
import type Request from "../models/request";
import { getDatabase } from "../utils/database";
import type { UserAvailabilityEnum } from "../models/user";
import type { TokenStatusEnum, TokenTypeEnum } from "../models/token";

const db = getDatabase();


export const updateRequestQuery = db.query<unknown,  {id: string, title: string, description: string, address: string, lat: number, lng: number, urgency: string }>(`
    UPDATE requests
       SET title            = $title,
           description      = $description,
           location_address = $address,
           location_lat     = $lat,
           location_lng     = $lng,
           urgency          = $urgency
     WHERE id = $id
  `);

export const updateRequestStatusQuery = db.query<unknown, {id: string, status: RequestStatusEnum}>(`UPDATE requests SET status = $status WHERE id = $id`);

export const handleRequestAssignmentQuery = db.query<unknown, {id: string, volunteer_id: string | null, status: RequestStatusEnum}>(`UPDATE requests SET volunteer_id = $volunteer_id, status = $status WHERE id = $id`);

export const findAllRequestsQuery = db.query(`
    SELECT 
        r.*,
         json_object(
      'address', r.location_address,
      'lat',     r.location_lat,
      'lng',     r.location_lng
    ) AS location,
        b.username as 'beneficiary.name', b.profile_img as 'beneficiary.profile_img', 
        v.username as 'volunteer.name', v.profile_img as 'volunteer.profile_img' 
    FROM requests r 
    LEFT JOIN users b ON b.id = r.beneficiary_id 
    LEFT JOIN users v ON v.id = r.volunteer_id 
    WHERE r.status IN ('open', 'in_progress')`
);

export const findRequestByIdQuery = db.query<Request, { id: string }>(`SELECT r.*,  json_object(
    'address', r.location_address,
    'lat',     r.location_lat,
    'lng',     r.location_lng
  ) AS location, u.username as beneficiary_name, u.profile_img as beneficiary_profile_img FROM requests r JOIN users u ON u.id = r.beneficiary_id  WHERE r.id = $id`);
        
export const findRequestsByVolunteerIdQuery = db.query<Request, { volunteer_id: string }>(`SELECT *,  json_object(
    'address', requests.location_address,
    'lat',     requests.location_lat,
    'lng',     requests.location_lng
  ) AS location FROM requests WHERE volunteer_id = $volunteer_id  AND status <> 'done' ORDER BY created_at DESC` );
export const findRequestsByStatusQuery = db.query<Request, { status: RequestStatusEnum }>(`SELECT *,  json_object(
    'address', requests.location_address,
    'lat',     requests.location_lat,
    'lng',     requests.location_lng
  ) AS location FROM requests WHERE  status = $status ORDER BY created_at DESC LIMIT 5`);
        
export const findRequestsByBeneficiaryIdQuery = db.query<Request, { beneficiary_id: string }>(`SELECT *, json_object(
    'address', requests.location_address,
    'lat',     requests.location_lat,
    'lng',     requests.location_lng
  ) AS location FROM requests WHERE beneficiary_id = $beneficiary_id AND status <> 'done' ORDER BY created_at DESC`);      

export const findDoneRequestsOfBeneficiaryQuery= db.query<Request, { beneficiary_id: string }>(`SELECT *, json_object(
    'address', requests.location_address,
    'lat',     requests.location_lat,
    'lng',     requests.location_lng
  ) AS location FROM requests WHERE beneficiary_id = $beneficiary_id  AND status = 'done'  ORDER BY created_at DESC`)
export const findDoneRequestsOfVolunteerQuery = db.query<Request, { volunteer_id: string }>(`SELECT *, json_object(
    'address', requests.location_address,
    'lat',     requests.location_lat,
    'lng',     requests.location_lng
  ) AS location FROM requests WHERE volunteer_id = $volunteer_id  AND status = 'done'  ORDER BY created_at DESC`)

export const updateUserQuery = db.query<unknown, { username: string; email: string; phone: string; profileImg: string; id: string }>(
    `UPDATE users SET username = $username, email = $email, phone = $phone, profile_img = $profileImg WHERE id = $id`
);

export const findActiveVolunteersQuery = db.query<User & { skills: string; availability: UserAvailabilityEnum }, []>(`SELECT * FROM users u LEFT JOIN volunteers v ON v.user_id = u.id WHERE status = 'active' AND type = 'volunteer' `);

export const updateVolunteerQuery = db.query<unknown, { skills: string; availability: string; id: string }>(
 `UPDATE volunteers SET skills = $skills, availability = $availability WHERE user_id = $id`
);

export const updateBeneficiaryQuery = db.query<unknown, { needs: string; location: string; id: string }>(
    `UPDATE beneficiaries SET needs = $needs, location = $location WHERE user_id = $id`
);

export const updateTokensStatusQuery = db.query<unknown, {userId: string, status: TokenStatusEnum, type: TokenTypeEnum}>(`UPDATE tokens SET status = $status WHERE user_id = $userId AND type = $type`);

export const deleteUserRegionsQuery = db.query<unknown, { user_id: string }>(`
    DELETE FROM user_regions
     WHERE user_id = $user_id
  `);
  
export const insertUserRegionQuery = db.query<unknown, { user_id: string, region_id: string }>(`
    INSERT OR IGNORE INTO user_regions (user_id, region_id)
         VALUES ($user_id, $region_id)
  `);


export const markAllNotificationsReadQuery = db.query<
unknown,
{ recipient_id: string }
>(`
UPDATE notification
   SET is_read = 1
 WHERE recipient_id = $recipient_id
`);

export const markNotificationReadQuery = db.query<
  unknown,
  { id: string; recipient_id: string }
>(`
  UPDATE notification
     SET is_read = 1
   WHERE id = $id
     AND recipient_id = $recipient_id
`);

export const deleteAllNotificationsQuery = db.query<
  unknown,
  { recipient_id: string }
>(`
  DELETE FROM notification
   WHERE recipient_id = $recipient_id
`);

export const markMessageReadQuery = db.query<
  unknown,
  { messageId: string; userId: string }
>(`
  UPDATE messages
     SET is_read = 1
   WHERE id = $messageId
     AND (user_id IS NULL OR user_id <> $userId)
`);