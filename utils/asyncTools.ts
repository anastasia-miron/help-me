export const asyncLoop = async (items: any[], callback: (item: any, index: number) => Promise<void>) => {
    for (let i = 0; i < items.length; i++) {
        await callback(items[i], i);
    }
};