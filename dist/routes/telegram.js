"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const app_1 = require("../app");
const ShopItem_1 = require("../models/ShopItem");
const UserItem_1 = require("../models/UserItem");
const Skin_1 = require("../models/Skin");
const UserSkin_1 = require("../models/UserSkin");
const router = (0, express_1.Router)();
router.post('/telegram', async (req, res) => {
    const update = req.body;
    console.log(update);
    try {
        if (update.pre_checkout_query) {
            // Handle pre_checkout_query
            await handlePreCheckoutQuery(update.pre_checkout_query);
            console.log('pre_checkout_query answered');
            res.sendStatus(200);
        }
        else if (update.message && update.message.successful_payment) {
            console.log('successful_payment about to call');
            // Handle successful payment
            await handleSuccessfulPayment(update.message);
            res.sendStatus(200);
        }
        else {
            // Handle other types of updates if needed
            console.log('Received update:', update);
            res.sendStatus(200);
        }
    }
    catch (error) {
        console.error('Error handling Telegram update:', error);
        res.sendStatus(500);
    }
});
async function handlePreCheckoutQuery(query) {
    try {
        await app_1.bot.api.answerPreCheckoutQuery(query.id, true);
        console.log('Pre-checkout query answered successfully', query);
    }
    catch (error) {
        console.error('Error answering pre-checkout query:', error);
        throw error;
    }
}
async function handleSuccessfulPayment(message) {
    try {
        const parsedPayload = JSON.parse(message.successful_payment.invoice_payload);
        if (parsedPayload.itemIds && parsedPayload.itemIds.length > 0) {
            // Fetch shop items by their IDs
            const shopItems = await ShopItem_1.ShopItem.findByIds(parsedPayload.itemIds);
            if (shopItems.length > 0) {
                // Create UserItem instances
                const userItems = shopItems.map(item => UserItem_1.UserItem.create({
                    user_id: parsedPayload.userId,
                    item_id: item.id,
                    item,
                }));
                // Bulk save the created UserItems
                const savedUserItems = await UserItem_1.UserItem.save(userItems);
                console.log('Successfully saved:', savedUserItems);
            }
            else {
                console.log('No shop items found for the given IDs');
            }
        }
        else if (parsedPayload.skin) {
            const skinItem = await Skin_1.Skin.findOne({ where: { id: parsedPayload.skin.id } });
            if (skinItem) {
                const userSkin = UserSkin_1.UserSkin.create();
                userSkin.user_id = parsedPayload.userId;
                userSkin.skin_id = skinItem.id;
                userSkin.skin = skinItem;
                await userSkin.save();
            }
        }
        else {
            console.log('No items to process in the payload');
        }
    }
    catch (error) {
        console.error('Error processing successful payment:', error);
    }
}
exports.default = router;
//# sourceMappingURL=telegram.js.map