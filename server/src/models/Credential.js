const { prisma } = require('../config/database');

function wrapCredential(cred) {
  if (!cred) return null;
  const instance = {
    ...cred,
    _id: cred.id,
    issuedBy: cred.issuedBy ? { ...cred.issuedBy, _id: cred.issuedBy.id } : cred.issuedById,
    revokedBy: cred.revokedByUser ? { ...cred.revokedByUser, _id: cred.revokedByUser.id } : cred.revokedById,
    async save() {
      const {
        _id, issuedBy, revokedBy, revokedByUser, save, toObject, toJSON, ...fields
      } = this;
      if (typeof fields.issuedById !== 'string' && issuedBy?._id) fields.issuedById = issuedBy._id;
      if (typeof fields.revokedById !== 'string' && revokedBy?._id) fields.revokedById = revokedBy._id;
      const updated = await prisma.credential.update({
        where: { id: this.id },
        data: fields
      });
      Object.assign(this, updated, { _id: updated.id });
      return this;
    },
    toObject() {
      const obj = { ...this };
      delete obj.save;
      delete obj.toObject;
      delete obj.toJSON;
      return obj;
    },
    toJSON() {
      return this.toObject();
    }
  };
  return instance;
}

function buildWhere(query = {}) {
  const where = {};
  if (query._id) where.id = String(query._id);
  if (query.id) where.id = String(query.id);
  if (query.issuedBy) where.issuedById = String(query.issuedBy?._id || query.issuedBy);
  if (query.studentWalletAddress) {
    if (typeof query.studentWalletAddress === 'string') {
      where.studentWalletAddress = { equals: query.studentWalletAddress.toLowerCase().trim(), mode: 'insensitive' };
    }
  }
  if (query.certificateHash) where.certificateHash = query.certificateHash;
  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;
  if (typeof query.isRevoked === 'boolean') where.isRevoked = query.isRevoked;
  if (query.createdAt?.$gte) where.createdAt = { gte: new Date(query.createdAt.$gte) };

  if (query.$or && Array.isArray(query.$or)) {
    where.OR = query.$or.map(cond => {
      const key = Object.keys(cond)[0];
      const val = cond[key];
      const pattern = val instanceof RegExp ? val.source : String(val);
      const clean = pattern.replace(/^\^|\$$/g, '').replace(/\\/g, '');
      return { [key]: { contains: clean, mode: 'insensitive' } };
    });
  }

  return where;
}

class CredentialQuery {
  constructor(initialQuery, isSingle = false) {
    this.initialQuery = initialQuery;
    this.isSingle = isSingle;
    this.options = {
      where: buildWhere(initialQuery),
      include: {}
    };
  }

  populate(path, select) {
    if (path === 'issuedBy') {
      this.options.include.issuedBy = true;
    } else if (path === 'revokedBy') {
      this.options.include.revokedByUser = true;
    }
    return this;
  }

  select(fields) {
    return this;
  }

  sort(sortObj) {
    if (sortObj) {
      const [key, dir] = Object.entries(sortObj)[0];
      this.options.orderBy = { [key]: dir === -1 || dir === 'desc' ? 'desc' : 'asc' };
    }
    return this;
  }

  limit(n) {
    this.options.take = Number(n);
    return this;
  }

  skip(n) {
    this.options.skip = Number(n);
    return this;
  }

  lean() {
    return this;
  }

  async execute() {
    if (Object.keys(this.options.include).length === 0) {
      this.options.include.issuedBy = true;
      this.options.include.revokedByUser = true;
    }

    if (this.isSingle) {
      const result = this.options.where.id
        ? await prisma.credential.findUnique({
            where: { id: this.options.where.id },
            include: this.options.include
          })
        : await prisma.credential.findFirst(this.options);
      return wrapCredential(result);
    }

    const results = await prisma.credential.findMany(this.options);
    return results.map(wrapCredential);
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

class CredentialModel {
  constructor() {
    this.prisma = prisma.credential;
  }

  findById(id) {
    return new CredentialQuery({ id: String(id) }, true);
  }

  findOne(query = {}) {
    return new CredentialQuery(query, true);
  }

  find(query = {}) {
    return new CredentialQuery(query, false);
  }

  async countDocuments(query = {}) {
    const where = buildWhere(query);
    return prisma.credential.count({ where });
  }

  async create(data) {
    const createData = { ...data };
    if (createData._id) {
      createData.id = String(createData._id);
      delete createData._id;
    }
    if (createData.issuedBy) {
      createData.issuedById = String(createData.issuedBy._id || createData.issuedBy);
      delete createData.issuedBy;
    }
    if (createData.revokedBy) {
      createData.revokedById = String(createData.revokedBy._id || createData.revokedBy);
      delete createData.revokedBy;
    }
    if (createData.studentWalletAddress) {
      createData.studentWalletAddress = createData.studentWalletAddress.toLowerCase().trim();
    }
    const created = await prisma.credential.create({
      data: createData,
      include: { issuedBy: true, revokedByUser: true }
    });
    return wrapCredential(created);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const rawData = update.$set || update;
    const data = { ...rawData };
    delete data._id;
    delete data.id;

    if (data.issuedBy) {
      data.issuedById = String(data.issuedBy._id || data.issuedBy);
      delete data.issuedBy;
    }
    if (data.revokedBy) {
      data.revokedById = String(data.revokedBy._id || data.revokedBy);
      delete data.revokedBy;
    }

    const cleanId = String(id);
    let result;
    if (options.upsert) {
      result = await prisma.credential.upsert({
        where: { id: cleanId },
        update: data,
        create: { id: cleanId, ...data },
        include: { issuedBy: true, revokedByUser: true }
      });
    } else {
      result = await prisma.credential.update({
        where: { id: cleanId },
        data,
        include: { issuedBy: true, revokedByUser: true }
      });
    }
    return wrapCredential(result);
  }

  async updateOne(filter, update) {
    const where = buildWhere(filter);
    const data = { ...(update.$set || {}) };
    if (update.$inc?.verificationCount) {
      data.verificationCount = { increment: update.$inc.verificationCount };
    }
    return prisma.credential.updateMany({ where, data });
  }

  async aggregate(pipeline) {
    let where = {};
    const matchStage = pipeline.find(s => s.$match);
    if (matchStage) where = buildWhere(matchStage.$match);
    const agg = await prisma.credential.aggregate({
      where,
      _sum: { verificationCount: true }
    });
    return [{ total: agg._sum.verificationCount || 0 }];
  }
}

module.exports = new CredentialModel();
