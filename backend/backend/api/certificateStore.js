const express = require('express');
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendItemResponse = require('../middlewares/response').sendItemResponse;
const CertificateStoreService = require('../services/certificateStoreService');
const StatusPageService = require('../services/statusPageService');
// const greenlock = require('../../greenlock');
const greenlock = global.greenlock;

const router = express.Router();

// store certificate details to the db
router.post('/store', async (req, res) => {
    try {
        const data = req.body;

        const certificate = await CertificateStoreService.create(data);
        return sendItemResponse(req, res, certificate);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// update certificate details in the db
router.put('/store/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const certificate = await CertificateStoreService.updateOneBy(
            { id },
            req.body
        );

        return sendItemResponse(req, res, certificate);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// fetch a certificate detail
router.get('/store/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const certificate = await CertificateStoreService.findOneBy({
            query: { id },
            select:
                'id privateKeyPem privateKeyJwk cert chain privKey subject altnames issuedAt expiresAt deleted deletedAt',
        });

        return sendItemResponse(req, res, certificate);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// fetch a certificate by the subject
// called from the status page project
router.get('/store/cert/:subject', async (req, res) => {
    try {
        const { subject } = req.params;
        const certificate = await CertificateStoreService.findOneBy({
            query: { subject },
            select:
                'id privateKeyPem privateKeyJwk cert chain privKey subject altnames issuedAt expiresAt deleted deletedAt',
        });

        return sendItemResponse(req, res, certificate);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// delete an certificate detail
router.delete('/store/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const certificate = await CertificateStoreService.deleteBy({ id });
        return sendItemResponse(req, res, certificate);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/certOrder', async (req, res) => {
    try {
        const domains = [];

        const statusPages = await StatusPageService.findBy({
            query: {
                'domains.enableHttps': { $eq: true },
                'domains.autoProvisioning': { $eq: true },
                'domains.domain': { $type: 'string' },
            },
            skip: 0,
            limit: 99999,
            select: 'domains',
        });

        for (const statusPage of statusPages) {
            for (const domain of statusPage.domains) {
                if (
                    domain.domain &&
                    domain.domain.trim() &&
                    domain.enableHttps &&
                    domain.autoProvisioning
                ) {
                    domains.push(domain.domain);
                }
            }
        }

        console.log('** domains outside **', domains);
        console.log('** outside greenlock **', greenlock);

        if (greenlock) {
            console.log('** inside greenlock **', greenlock);
            console.log('** domains **', domains);
            for (const domain of domains) {
                // run in the background
                await greenlock.add({
                    subject: domain,
                    altnames: [domain],
                });
            }
        }

        return sendItemResponse(req, res, 'Certificate renewal triggered...');
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;
