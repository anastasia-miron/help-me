import { CronJob } from 'cron';
import { RequestStatusEnum } from '../models/request';
import { findActiveVolunteersQuery, findRequestsByStatusQuery } from '../db/queries';
import { UserAvailabilityEnum } from '../models/user';
import { asyncLoop } from '../utils/asyncTools';
import { sendMail } from "../service/email.service";
import hbs from 'handlebars';
import fs from 'node:fs';
import path from 'node:path';


const filepath = path.join(__dirname, '../templates/new-request.hbs');
const contentNewRequests = fs.readFileSync(filepath, 'utf-8');
const templateNewRequests = hbs.compile(contentNewRequests);

export default () => {
    new CronJob('0 0 * * * *', () => {
        const date = new Date(); 
        const weekday = date.getDay();
        const hour = date.getHours();
        const requests = findRequestsByStatusQuery.all({ status: RequestStatusEnum.OPEN });
        if (requests.length === 0) return;

        const volunteers = findActiveVolunteersQuery.all();
        if (volunteers.length === 0) return;

        const availableVolunteers = volunteers.filter(user => {
            if (user.availability === UserAvailabilityEnum.ANY_TIME) return true;
            if (user.availability === UserAvailabilityEnum.NONE) return false;
            if (user.availability === UserAvailabilityEnum.FLEXIBLE) return true;
            if (user.availability === UserAvailabilityEnum.WEEKENDS) return [0, 6].includes(weekday);
            if (user.availability === UserAvailabilityEnum.FULL_TIME) return (weekday > 0 && weekday < 6 && hour > 8 && hour < 18);
            if (user.availability === UserAvailabilityEnum.EVENINGS) return (weekday > 0 && weekday < 6 && hour > 17 && hour < 23);
        });

        if (availableVolunteers.length === 0) return;

        asyncLoop(availableVolunteers, async(v) => {
            sendMail({
                to: v.email,
                subject: 'New requests',
                message: templateNewRequests({requests})
            });
        })
        
    }, null, true, 'Europe/Bucharest', null, false);
};