const Router = require('@koa/router');
const Item = require('../models/Item');
const Bid = require('../models/Bid');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = new Router({
    prefix: '/api/items'
});

router.get('/', async (ctx) => {
    try {
        const items = await Item.find().populate('seller', 'username');
        ctx.body = items;
    } catch (err) {
        ctx.status = 500;
        ctx.body = 'Server Error';
        console.error(err.message);
    }
});

router.get('/:id', async (ctx) => {
    try {
        const item = await Item.findById(ctx.params.id).populate('seller', 'username');
        if (!item) {
            ctx.status = 404;
            ctx.body = { error: 'Item not found' };
            return;
        }
        ctx.body = item;
    } catch (err) {
        ctx.status = 500;
        ctx.body = 'Server Error';
        console.error(err.message);
    }
});

router.post('/:id/bid', authMiddleware, async (ctx) => {
    try {
        const item = await Item.findById(ctx.params.id);
        if (!item) {
            ctx.status = 404;
            ctx.body = { error: 'Item not found' };
            return;
        }

        const { amount } = ctx.request.body;
        if (amount <= item.currentBid || amount <= item.startingPrice) {
            ctx.status = 400;
            ctx.body = { error: 'Bid must be higher than the current bid or starting price.' };
            return;
        }

        if (new Date() > item.endTime) {
            ctx.status = 400;
            ctx.body = { error: 'Auction has ended' };
            return;
        }
        
        if (ctx.state.user.id === item.seller._id.toString()) {
          ctx.status = 400;
          ctx.body = { error: 'You cannot bid on your own item.' };
          return;
        }

        const newBid = new Bid({
            item: item._id,
            bidder: ctx.state.user.id,
            amount: amount,
        });
        await newBid.save();

        item.currentBid = amount;
        item.bidder = ctx.state.user.id;
        await item.save();

        const updatedItem = await Item.findById(item._id).populate('seller', 'username');

        ctx.body = { message: 'Bid placed successfully', item: updatedItem };
    } catch (err) {
        console.error(err.message);
        ctx.status = 500;
        ctx.body = 'Server Error';
    }
});

module.exports = router;