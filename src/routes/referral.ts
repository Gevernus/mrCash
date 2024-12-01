import { Router } from 'express';
import { Referral } from '../models/Referral';
import { AppDataSource } from '../app';

const router = Router();

router.get('/:userId/referrals', async (req, res) => {
    const userId = req.params.userId;

    try {
        const referrals = await Referral.find({
            where: { inviterId: userId }
        });
        res.json(referrals);
    } catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).send('Error fetching referrals');
    }
});

router.post('/:userId/claim', async (req, res) => {
    const userId = req.params.userId;
    const { referralId } = req.body;

    await AppDataSource.transaction(async transactionalEntityManager => {
        const referral = await Referral.findOne({ where: { inviterId: userId, id: referralId } });
        if (!referral) {
            throw new Error('Referral not found');
        }

        referral.status = 'claimed';
        await referral.save();
    }).then(() => {
        res.send('Bonus claimed successfully');
    }).catch(error => {
        console.error('Error claiming bonus:', error);
        res.status(500).send(`Error claiming bonus: ${error.message}`);
    });
});

export default router;