import { Router } from 'express';
import { User } from '../models/User';
import { State } from '../models/State';

const router = Router();

router.post('/check-user', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        res.json({ exists: !!user, user: user || undefined });
    } catch (error) {
        console.error('Error checking user:', error);
        res.status(500).json({ error: 'Error checking user' });
    }
});

router.post('/register', async (req, res) => {
    const { username } = req.body;
    try {
        const user = User.create({ username });
        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

router.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findOne({ where: { id: userId } });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
});

router.post('/user/:id/energy', async (req, res) => {
    const userId = req.params.id;
    const { energy } = req.body;
    try {
        const state = await State.findOne({ where: { id: userId } });
        if (!state) {
            return res.status(404).json({ error: 'User not found' });
        }
        state.energy = energy;
        await state.save();
        res.json({ message: 'User energy updated successfully' });
    } catch (error) {
        console.error('Error updating user energy:', error);
        res.status(500).json({ error: 'Error updating user energy' });
    }
});

router.post('/user/:id/update', async (req, res) => {
    const userId = req.params.id;
    const userData = req.body;
    console.log('UserData is ', userData)
    try {
        const state = await State.findOne({ where: { id: userId } });
        if (!state) {
            return res.status(404).json({ error: 'User not found' });
        }
        state.coins = userData.coins;
        state.tap_power = userData.tap_power;
        state.energy = userData.energy;
        await state.save();
        res.json({ message: 'User data updated successfully' });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Error updating user data' });
    }
});

// router.post('/user', async (req, res) => {
//     const userData: User = req.body;
//     try {
//         let user;
//         const result = await User.createQueryBuilder()
//             .insert()
//             .values(userData)
//             .orIgnore()
//             .returning("*")
//             .execute();
//         if (result.raw.length > 0) {
//             user = result.raw[0];
//         } else {
//             user = await User.findOne({ where: { id: userData.id } });
//         }
//         console.log('User updated:', user);
//         return res.status(200).json({ message: "User data saved successfully", user });
//     } catch (error) {
//         console.error(`Error saving user: ${userData}`, error);
//         return res.status(500).json({ message: "Error saving user data" });
//     }
// });

export default router;