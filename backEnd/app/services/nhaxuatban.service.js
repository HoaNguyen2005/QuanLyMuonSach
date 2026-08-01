const { ObjectId } = require("mongodb");

class NhaXuatBanService {
    constructor(client) {
        this.Nxb = client.db().collection("nhaxuatban");
    }

    extractNxbData(payload) {
        const nxb = {
            maNXB: payload.maNXB ,
            tenNXB: payload.tenNXB ,
            diaChi: payload.diaChi || ""
        };

        Object.keys(nxb).forEach(
            (key) => nxb[key] === undefined && delete nxb[key]
        );

        console.log("[DEBUG BACKEND - NxbService] Extracted NXB data:", JSON.stringify(nxb, null, 2));
        return nxb;
    }

    async create(payload) {
        console.log("[DEBUG BACKEND - NxbService] Creating NXB with raw payload:", JSON.stringify(payload, null, 2));
        const nxb = this.extractNxbData(payload);
        const result = await this.Nxb.findOneAndUpdate(
            { maNXB: nxb.maNXB },
            { $set: nxb },
            { returnDocument: "after", upsert: true }
        );
        console.log("[DEBUG BACKEND - NxbService] Create result:", JSON.stringify(result, null, 2));
        return result;
    }

    async find(filter) {
        console.log("[DEBUG BACKEND - NxbService] Finding list with filter:", JSON.stringify(filter));
        const cursor = await this.Nxb.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        console.log(`[DEBUG BACKEND - NxbService] Finding NXB by ID/maNXB: '${id}'`);
        let result = await this.Nxb.findOne({ maNXB: id });
        if (!result && ObjectId.isValid(id)) {
            result = await this.Nxb.findOne({ _id: new ObjectId(id) });
        }
        return result;
    }

    async update(id, payload) {
        console.log(`[DEBUG BACKEND - NxbService] Updating NXB '${id}' with payload:`, JSON.stringify(payload, null, 2));
        const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { maNXB: id };
        const update = this.extractNxbData(payload);
        const result = await this.Nxb.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        console.log(`[DEBUG BACKEND - NxbService] Deleting NXB '${id}'`);
        const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { maNXB: id };
        const result = await this.Nxb.findOneAndDelete(filter);
        return result;
    }
}

module.exports = NhaXuatBanService;