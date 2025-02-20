import type { Context } from 'hono'
import { stream, streamText, streamSSE } from 'hono/streaming'
import { v4 } from 'uuid';
import pubsub from '../utils/pubsub';


export const requestSSE = (c: Context) => {
    return streamSSE(c, async (stream) => {
        const unsubscribe = pubsub.on('message', async (data) => {
            console.log(data);
            await stream.writeSSE({
                event: "message",
                data: JSON.stringify(data),
                id: v4(),
            });
        });
        stream.onAbort(unsubscribe);
        while (true) {
            await stream.sleep(5000); 
            await stream.writeSSE({
                event: "ping",
                data: "",
                id: v4(),
            })
        }
    }, async (err) => { console.error(err) });
}