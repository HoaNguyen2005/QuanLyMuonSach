const fs = require("fs");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

try {
  require("dotenv").config();
} catch (e) {
  console.log("[DEBUG SEED] dotenv không được cài đặt, sử dụng cấu hình mặc định.");
}

// Config MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/QuanLyMuonSach";
const DB_NAME = process.env.DB_NAME || "QuanLyMuonSach";

// Đường dẫn tới thư mục chứa file JSON dữ liệu mẫu (mongodb_json)
const DATA_DIR = path.join(__dirname, "mongodb_json");

// Danh sách các Collection tương ứng với file JSON trong thư mục /mongodb_json
const SEED_FILES = [
  { collection: "nhaxuatban", file: "QuanLyMuonSach.nhaxuatban.json" },
  { collection: "sach", file: "QuanLyMuonSach.sach.json" },
  { collection: "docgia", file: "QuanLyMuonSach.docgia.json" },
  { collection: "nhanvien", file: "QuanLyMuonSach.nhanvien.json" },
  { collection: "theodoimuonsach", file: "QuanLyMuonSach.theodoimuonsach.json" },
  { collection: "phieuphat", file: "QuanLyMuonSach.phieuphat.json" }

];

/**
 * Hàm tự động chuyển đổi các trường kiểu Extended JSON ($oid, $date) 
 * về dạng ObjectId và Date object gốc của MongoDB
 */
function transformEJSON(data) {
  if (Array.isArray(data)) {
    return data.map(item => transformEJSON(item));
  }
  
  if (data !== null && typeof data === "object") {
    // Chuyển { "$oid": "..." } thành ObjectId("...")
    if (Object.keys(data).length === 1 && data.$oid) {
      return new ObjectId(data.$oid);
    }
    
    // Chuyển { "$date": "..." } thành Date object
    if (Object.keys(data).length === 1 && data.$date) {
      return new Date(data.$date);
    }

    // Đệ quy quét qua các thuộc tính lồng nhau
    const transformed = {};
    for (const key of Object.keys(data)) {
      transformed[key] = transformEJSON(data[key]);
    }
    return transformed;
  }

  return data;
}

async function seedDatabase() {
  const client = new MongoClient(MONGO_URI);

  console.log("==================================================");
  console.log(`[DEBUG SEED] Dang ket noi toi MongoDB: ${MONGO_URI}...`);

  try {
    await client.connect();
    console.log(`[DEBUG SEED] Ket noi thanh cong DB: "${DB_NAME}"`);

    const db = client.db(DB_NAME);

    for (const item of SEED_FILES) {
      const filePath = path.join(DATA_DIR, item.file);

      if (!fs.existsSync(filePath)) {
        console.warn(`[DEBUG SEED WARN] Khong tim thay file ${item.file} tai ${filePath}. Bo qua...`);
        continue;
      }

      const rawData = fs.readFileSync(filePath, "utf-8");
      let data = JSON.parse(rawData);

      if (!Array.isArray(data) || data.length === 0) {
        console.log(`[DEBUG SEED INFO] File ${item.file} rong. Bo qua...`);
        continue;
      }

      // Format lại dữ liệu Extended JSON ($oid, $date) trước khi insert
      data = transformEJSON(data);

      const collection = db.collection(item.collection);

      // Xóa dữ liệu cũ và Insert dữ liệu mới
      await collection.deleteMany({});
      console.log(`[DEBUG SEED] Da lam sach collection: "${item.collection}"`);

      const result = await collection.insertMany(data);
      console.log(`[DEBUG SEED SUCCESS] Da them ${result.insertedCount} ban ghi vao "${item.collection}"`);
    }

    console.log("==================================================");
    console.log("[DEBUG SEED COMPLETED] Nap du lieu seed thanh cong!");
  } catch (error) {
    console.error("[DEBUG SEED ERROR] Loi khi seed database:", error);
  } finally {
    await client.close();
    console.log("[DEBUG SEED] Da dong ket noi MongoDB.");
    process.exit(0);
  }
}

seedDatabase();