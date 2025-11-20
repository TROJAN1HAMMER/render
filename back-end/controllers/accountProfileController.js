const fs = require('fs');
const path = require('path');
const prisma = require('../prisma/prisma');

const UPI_QR_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'upi-qr');
const CONTACT_ALLOWED_PATTERN = /^[0-9+\s()-]+$/;
const IFSC_REGEX = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;

const ensureUploadDir = async () => {
  await fs.promises.mkdir(UPI_QR_UPLOAD_DIR, { recursive: true });
};

const sanitizeOptional = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const normalizeContactNumber = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  let trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  trimmed = trimmed.replace(/\s+/g, '');

  let prefix = '';
  if (trimmed.startsWith('+')) {
    prefix = '+';
    trimmed = trimmed.slice(1);
  }

  const digits = trimmed.replace(/\D/g, '');
  return prefix ? `${prefix}${digits}` : digits;
};

const getBaseUrl = (req) => {
  const configured = process.env.FILE_BASE_URL;
  if (configured && typeof configured === 'string') {
    return configured.replace(/\/+$/, '');
  }

  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};

const buildFileUrl = (req, fileName) => {
  const relativePath = ['uploads', 'upi-qr', fileName].join('/');
  return `${getBaseUrl(req)}/${relativePath}`;
};

const resolveStoredFilePath = (storedUrl) => {
  if (!storedUrl || typeof storedUrl !== 'string') {
    return null;
  }

  let relative = storedUrl;

  if (/^https?:\/\//i.test(storedUrl)) {
    try {
      const url = new URL(storedUrl);
      relative = url.pathname;
    } catch (err) {
      return null;
    }
  }

  relative = relative.replace(/^\/*/, '');
  if (!relative.startsWith('uploads/')) {
    return null;
  }

  return path.join(__dirname, '..', relative);
};

const deleteFileIfExists = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`Failed to delete old UPI QR image at ${filePath}`, err);
    }
  }
};

const accountProfileController = {
  async getAccountProfile(req, res) {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const profile = await prisma.plumberAccountProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.json({ data: profile });
    } catch (error) {
      console.error('getAccountProfile error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async upsertAccountProfile(req, res) {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      fullName,
      contactNumber,
      upiId,
      email,
      bankName,
      accountNumber,
      accountHolderName,
      ifscCode,
      branchName,
    } = req.body;

    const file = req.file;
    const validationErrors = {};

    const fullNameValue = typeof fullName === 'string' ? fullName.trim() : '';
    if (!fullNameValue) {
      validationErrors.fullName = 'Full name is required';
    }

    const contactNumberValue = typeof contactNumber === 'string' ? contactNumber.trim() : '';
    if (!contactNumberValue) {
      validationErrors.contactNumber = 'Contact number is required';
    } else if (!CONTACT_ALLOWED_PATTERN.test(contactNumberValue)) {
      validationErrors.contactNumber = 'Contact number may contain only digits, spaces, parentheses, hyphens, and plus';
    } else {
      const digitsCount = contactNumberValue.replace(/\D/g, '').length;
      if (digitsCount < 7 || digitsCount > 15) {
        validationErrors.contactNumber = 'Contact number must have between 7 and 15 digits';
      }
    }

    const normalizedContact = normalizeContactNumber(contactNumberValue);

    const upiIdValue = sanitizeOptional(upiId);
    if (upiIdValue) {
      if (!upiIdValue.includes('@') || upiIdValue.length < 5 || upiIdValue.length > 50) {
        validationErrors.upiId = 'Invalid UPI ID';
      }
    }

    let emailValue = sanitizeOptional(email);
    if (emailValue) {
      emailValue = emailValue.toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue)) {
        validationErrors.email = 'Invalid email address';
      }
    }

    const bankNameValue = sanitizeOptional(bankName);
    const accountNumberValue = sanitizeOptional(accountNumber);
    if (bankNameValue && (!accountNumberValue || accountNumberValue.length < 6)) {
      validationErrors.accountNumber = 'Account number is required and must be at least 6 characters when bank name is provided';
    }

    const accountHolderNameValue = sanitizeOptional(accountHolderName);

    const ifscCodeValue = sanitizeOptional(ifscCode);
    if (ifscCodeValue && !IFSC_REGEX.test(ifscCodeValue)) {
      validationErrors.ifscCode = 'Invalid IFSC code';
    }

    const branchNameValue = sanitizeOptional(branchName);

    if (file && !['image/jpeg', 'image/png'].includes(file.mimetype)) {
      validationErrors.upiQrImage = 'Only JPEG or PNG images are allowed';
    }

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    try {
      const existingProfile = await prisma.plumberAccountProfile.findUnique({
        where: { userId },
      });

      let upiQrUrl = existingProfile?.upiQrUrl ?? null;

      if (file) {
        await ensureUploadDir();

        const oldFilePath = resolveStoredFilePath(existingProfile?.upiQrUrl);

        const originalExt = path.extname(file.originalname).toLowerCase();
        let extension = '';
        if (['.jpeg', '.jpg', '.png'].includes(originalExt)) {
          extension = originalExt === '.jpeg' ? '.jpg' : originalExt;
        } else {
          extension = file.mimetype === 'image/png' ? '.png' : '.jpg';
        }

        const fileName = `${userId}-${Date.now()}${extension}`;
        const filePath = path.join(UPI_QR_UPLOAD_DIR, fileName);

        await fs.promises.writeFile(filePath, file.buffer);

        await deleteFileIfExists(oldFilePath);

        upiQrUrl = buildFileUrl(req, fileName);
      }

      const payload = {
        fullName: fullNameValue,
        contactNumber: normalizedContact,
        upiId: upiIdValue,
        upiQrUrl,
        email: emailValue,
        bankName: bankNameValue,
        accountNumber: accountNumberValue,
        accountHolderName: accountHolderNameValue,
        ifscCode: ifscCodeValue,
        branchName: branchNameValue,
      };

      const profile = await prisma.plumberAccountProfile.upsert({
        where: { userId },
        update: payload,
        create: {
          userId,
          ...payload,
        },
      });

      const statusCode = existingProfile ? 200 : 201;
      return res.status(statusCode).json({ data: profile });
    } catch (error) {
      console.error('upsertAccountProfile error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = accountProfileController;

