import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export async function getImages() {
  const query = `SELECT * FROM images ORDER BY created DESC`;
  const [result] = await pool.query(query);
  return result;
}

export async function getImage(id) {
  const query = `SELECT * FROM images WHERE id = ?`;
  const [rows] = await pool.query(query, [id]);
  const result = rows[0];
  return result;
}

export async function addImage(imagePath, detail) {
  let query = `INSERT INTO images (imagePath, detail) VALUES(?, ?)`;

  const [result] = await pool.query(query, [imagePath, detail]);
  const id = result.insertId;
  console.log("🔅 Data added in Database");
  return await getImage(id);
}

export async function deleteImage(id) {
  const query = `DELETE FROM images WHERE id = ?`;
  await pool.query(query, [id]);
  console.log("🔅 Data deleted from Database");
  return getImages();
}

// export async function deleteImage()

//exports.addNote : 이건 old way..
