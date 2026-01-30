import pool from '../config/database.js';
import bcrypt from 'bcrypt';

class Account {
    // Create new account
    static async create({ name, password, email, nickname }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const premdays = parseInt(process.env.PREM_DAYS) || 0;

        const result = await pool.query(
            `INSERT INTO accounts (name, password, email, nickname, premdays, lastday)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, nickname, premdays, created_at`,
            [name, hashedPassword, email, nickname, premdays, Math.floor(Date.now() / 1000)]
        );

        return result.rows[0];
    }

    // Find account by name
    static async findByName(name) {
        const result = await pool.query(
            'SELECT * FROM accounts WHERE name = $1',
            [name]
        );
        return result.rows[0];
    }

    // Find account by ID
    static async findById(id) {
        const result = await pool.query(
            'SELECT id, name, email, nickname, premdays, created_at FROM accounts WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Validate login
    static async validateLogin(name, password) {
        const account = await this.findByName(name);
        if (!account) return null;

        const isValid = await bcrypt.compare(password, account.password);
        if (!isValid) return null;

        // Return account without password
        const { password: _, ...accountData } = account;
        return accountData;
    }

    // Update password
    static async updatePassword(accountId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE accounts SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, accountId]
        );
    }

    // Generate recovery key
    static async generateRecoveryKey(accountId) {
        const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const hashedKey = await bcrypt.hash(key, 10);

        await pool.query(
            'UPDATE accounts SET recovery_key = $1 WHERE id = $2',
            [hashedKey, accountId]
        );

        return key; // Return unhashed key to show user once
    }

    // Validate recovery key
    static async validateRecoveryKey(email, key) {
        const result = await pool.query(
            'SELECT id, recovery_key FROM accounts WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) return null;

        const account = result.rows[0];
        if (!account.recovery_key) return null;

        const isValid = await bcrypt.compare(key, account.recovery_key);
        return isValid ? account.id : null;
    }

    // Check if account name exists
    static async nameExists(name) {
        const result = await pool.query(
            'SELECT id FROM accounts WHERE name = $1',
            [name]
        );
        return result.rows.length > 0;
    }

    // Check if email exists
    static async emailExists(email) {
        const result = await pool.query(
            'SELECT id FROM accounts WHERE email = $1',
            [email]
        );
        return result.rows.length > 0;
    }

    // Check if nickname exists
    static async nicknameExists(nickname) {
        const result = await pool.query(
            'SELECT id FROM accounts WHERE nickname = $1',
            [nickname]
        );
        return result.rows.length > 0;
    }
}

export default Account;
