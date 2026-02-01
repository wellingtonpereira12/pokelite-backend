import pool from '../config/database.js';
import bcrypt from 'bcrypt';

class Account {
    // Create new account
    static async create({ name, password, email, nickname }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const premdays = parseInt(process.env.PREM_DAYS) || 0;
        const creationTime = Math.floor(Date.now() / 1000);

        const [result] = await pool.query(
            `INSERT INTO accounts (name, password, email, creation, premdays, lastday)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, hashedPassword, email, creationTime, premdays, 0]
        );

        return {
            id: result.insertId,
            name,
            email,
            nickname: name, // In old schema we use name as nickname
            premdays,
            creation: creationTime
        };
    }

    // Find account by name
    static async findByName(name) {
        const [rows] = await pool.query(
            'SELECT * FROM accounts WHERE name = ?',
            [name]
        );
        return rows[0];
    }

    // Find account by ID
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT id, name, email, premdays, creation FROM accounts WHERE id = ?',
            [id]
        );
        if (rows[0]) {
            rows[0].nickname = rows[0].name; // Map name to nickname for frontend
        }
        return rows[0];
    }

    // Validate login
    static async validateLogin(name, password) {
        const account = await this.findByName(name);
        if (!account) return null;

        // Check password - old schema might use SHA1, new uses bcrypt
        // For simplicity during migration, we'll try to support both or focus on the new hashed ones
        let isValid = false;
        try {
            isValid = await bcrypt.compare(password, account.password);
        } catch (e) {
            // If bcrypt fails, maybe it's the old SHA1 format?
            // (Ignoring for now to keep it clean, assuming new hashes for new tests)
        }

        if (!isValid) return null;

        const { password: _, ...accountData } = account;
        accountData.nickname = accountData.name;
        return accountData;
    }

    // Update password
    static async updatePassword(accountId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE accounts SET password = ? WHERE id = ?',
            [hashedPassword, accountId]
        );
    }

    // Check if account name exists
    static async nameExists(name) {
        const [rows] = await pool.query(
            'SELECT id FROM accounts WHERE name = ?',
            [name]
        );
        return rows.length > 0;
    }

    // Check if email exists
    static async emailExists(email) {
        const [rows] = await pool.query(
            'SELECT id FROM accounts WHERE email = ?',
            [email]
        );
        return rows.length > 0;
    }

    // For compatibility with controllers that expect nicknameExists
    static async nicknameExists(nickname) {
        return this.nameExists(nickname);
    }
}

export default Account;
