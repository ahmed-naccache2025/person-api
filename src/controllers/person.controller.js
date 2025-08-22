import { pool } from "../db.js";

/**
 * Helper: fetch contacts for a person
 */
async function fetchContacts(personId) {
  const [rows] = await pool.query(
    `SELECT c.* 
     FROM persons c
     JOIN person_contacts pc ON c.id = pc.contact_id
     WHERE pc.person_id = ?
     ORDER BY c.email`,
    [personId]
  );
  return rows;
}

/**
 * ✅ Create Person
 */
export async function createPerson(req, res, next) {
  const { name, surname, age, gender, birthday, phone, email, contacts } = req.validated;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO persons (name, surname, age, gender, birthday, phone, email)
       VALUES (?,?,?,?,?,?,?)`,
      [name, surname, age ?? null, gender ?? null, birthday ?? null, phone ?? null, email]
    );

    const personId = result.insertId;

    if (contacts && contacts.length) {
      for (const c of contacts) {
        await conn.query(
          `INSERT IGNORE INTO person_contacts (person_id, contact_id) VALUES (?,?)`,
          [personId, c]
        );
      }
    }

    await conn.commit();

    const [rows] = await conn.query("SELECT * FROM persons WHERE id=?", [personId]);
    const populatedContacts = await fetchContacts(personId);

    res.status(201).json({ ...rows[0], contacts: populatedContacts });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * ✅ Get Person by ID
 */
export async function getPerson(req, res, next) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM persons WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const contacts = await fetchContacts(id);
    res.json({ ...rows[0], contacts });
  } catch (err) {
    next(err);
  }
}

/**
 * ✅ Update Person
 */
export async function updatePerson(req, res, next) {
  const { id } = req.params;
  const { name, surname, age, gender, birthday, phone, email, contacts } = req.validated;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Build dynamic query
    const fields = { name, surname, age, gender, birthday, phone, email };
    const sets = [];
    const values = [];
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        sets.push(`${key}=?`);
        values.push(value);
      }
    }

    if (sets.length) {
      const q = `UPDATE persons SET ${sets.join(", ")}, modified=NOW() WHERE id=?`;
      values.push(id);
      const [result] = await conn.query(q, values);
      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ error: "Not found" });
      }
    }

    // Sync contacts
    if (contacts !== undefined) {
      await conn.query("DELETE FROM person_contacts WHERE person_id=?", [id]);
      if (contacts && contacts.length) {
        for (const c of contacts) {
          await conn.query(
            `INSERT IGNORE INTO person_contacts (person_id, contact_id) VALUES (?,?)`,
            [id, c]
          );
        }
      }
    }

    await conn.commit();

    const [rows] = await conn.query("SELECT * FROM persons WHERE id=?", [id]);
    const populatedContacts = await fetchContacts(id);

    res.json({ ...rows[0], contacts: populatedContacts });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * ✅ Delete Person
 */
export async function deletePerson(req, res, next) {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM persons WHERE id=? LIMIT 1", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 * ✅ List Persons with Pagination ordered by email
 */
export async function listPersons(req, res, next) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM persons ORDER BY email LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[count]] = await pool.query("SELECT COUNT(*) AS total FROM persons");

    res.json({ page, limit, total: count.total, data: rows });
  } catch (err) {
    next(err);
  }
}
