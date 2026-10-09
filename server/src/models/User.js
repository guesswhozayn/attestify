const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');

function wrapUser(user) {
  if (!user) return null;
  const instance = {
    ...user,
    _id: user.id,
    async comparePassword(candidatePassword) {
      if (!this.password) return false;
      return bcrypt.compare(candidatePassword, this.password);
    },
    async save() {
      if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        this.password = await bcrypt.hash(this.password, 10);
      }
      const { _id, comparePassword, save, toObject, toJSON, ...data } = this;
      const updated = await prisma.user.update({
        where: { id: this.id },
        data
      });
      Object.assign(this, updated, { _id: updated.id });
      return this;
    },
    toObject() {
      const obj = { ...this };
      delete obj.comparePassword;
      delete obj.save;
      delete obj.toObject;
      delete obj.toJSON;
      return obj;
    },
    toJSON() {
      const obj = this.toObject();
      delete obj.password;
      return obj;
    }
  };
  return instance;
}

class UserModel {
  constructor() {
    this.prisma = prisma.user;
  }

  findById(id) {
    const promise = (async () => {
      if (!id) return null;
      const user = await prisma.user.findUnique({ where: { id: String(id) } });
      return wrapUser(user);
    })();
    promise.select = () => promise;
    return promise;
  }

  findOne(query = {}) {
    const promise = (async () => {
      const where = {};
      if (query.email) where.email = query.email.toLowerCase().trim();
      if (query.walletAddress) {
        if (typeof query.walletAddress === 'string') {
          where.walletAddress = { equals: query.walletAddress.toLowerCase().trim(), mode: 'insensitive' };
        } else if (query.walletAddress.$regex) {
          const val = (query.walletAddress.$regex.source || String(query.walletAddress.$regex))
            .replace(/^\^|\$$/g, '')
            .replace(/\\/g, '');
          where.walletAddress = { equals: val.toLowerCase().trim(), mode: 'insensitive' };
        }
      }
      if (query['issuerDetails.registrationNumber']) {
        where.issuerDetails = {
          path: ['registrationNumber'],
          equals: query['issuerDetails.registrationNumber']
        };
      }
      if (query._id?.$ne) {
        where.id = { not: String(query._id.$ne) };
      }
      if (query.role) where.role = query.role;

      const user = await prisma.user.findFirst({ where });
      return wrapUser(user);
    })();
    promise.select = () => promise;
    return promise;
  }

  async create(data) {
    const createData = { ...data };
    if (createData.email) createData.email = createData.email.toLowerCase().trim();
    if (createData.walletAddress) createData.walletAddress = createData.walletAddress.toLowerCase().trim();
    if (createData.password && !createData.password.startsWith('$2a$') && !createData.password.startsWith('$2b$')) {
      createData.password = await bcrypt.hash(createData.password, 10);
    }
    delete createData._id;
    const user = await prisma.user.create({ data: createData });
    return wrapUser(user);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const rawData = update.$set || update;
    const data = { ...rawData };
    delete data._id;
    delete data.id;

    if (data['issuerDetails.institutionName'] || data['issuerDetails.registrationNumber']) {
      const current = await prisma.user.findUnique({ where: { id: String(id) } });
      const currentDetails = current?.issuerDetails || {};
      if (data['issuerDetails.institutionName']) currentDetails.institutionName = data['issuerDetails.institutionName'];
      if (data['issuerDetails.registrationNumber']) currentDetails.registrationNumber = data['issuerDetails.registrationNumber'];
      delete data['issuerDetails.institutionName'];
      delete data['issuerDetails.registrationNumber'];
      data.issuerDetails = currentDetails;
    }

    if (update.$inc) {
      for (const [key, val] of Object.entries(update.$inc)) {
        if (key === 'issuerDetails.certificatesIssued') {
          const current = await prisma.user.findUnique({ where: { id: String(id) } });
          const currentDetails = current?.issuerDetails || {};
          currentDetails.certificatesIssued = (currentDetails.certificatesIssued || 0) + val;
          data.issuerDetails = currentDetails;
        } else if (key === 'tokenVersion') {
          data.tokenVersion = { increment: val };
        }
      }
    }

    if (data.password && !data.password.startsWith('$2a$') && !data.password.startsWith('$2b$')) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: String(id) },
      data
    });
    return wrapUser(updated);
  }
}

module.exports = new UserModel();
