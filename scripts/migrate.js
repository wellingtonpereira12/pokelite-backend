import pool from '../config/database.js';

const createTables = async () => {
    const client = await pool.connect();

    try {
        console.log('🔄 Starting database migration...');

        // Create accounts table
        await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(32) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        nickname VARCHAR(32) UNIQUE NOT NULL,
        premdays INTEGER DEFAULT 0,
        lastday BIGINT DEFAULT 0,
        recovery_key VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Table "accounts" created');

        // Create players table
        await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        name VARCHAR(255) UNIQUE NOT NULL,
        world_id INTEGER DEFAULT 0,
        group_id INTEGER DEFAULT 1,
        sex INTEGER DEFAULT 0,
        vocation INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        experience BIGINT DEFAULT 0,
        health INTEGER DEFAULT 150,
        healthmax INTEGER DEFAULT 150,
        mana INTEGER DEFAULT 0,
        manamax INTEGER DEFAULT 0,
        maglevel INTEGER DEFAULT 0,
        manaspent BIGINT DEFAULT 0,
        soul INTEGER DEFAULT 0,
        town_id INTEGER DEFAULT 1,
        posx INTEGER DEFAULT 492,
        posy INTEGER DEFAULT 1203,
        posz INTEGER DEFAULT 6,
        conditions BYTEA,
        cap INTEGER DEFAULT 400,
        lastlogin BIGINT DEFAULT 0,
        lastlogout BIGINT DEFAULT 0,
        lastip VARCHAR(15) DEFAULT '0.0.0.0',
        online INTEGER DEFAULT 0,
        skull INTEGER DEFAULT 0,
        skulltime INTEGER DEFAULT 0,
        rank_id INTEGER DEFAULT 0,
        comment TEXT,
        hide_char BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Table "players" created');

        // Create player_skills table
        await client.query(`
      CREATE TABLE IF NOT EXISTS player_skills (
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        skillid INTEGER NOT NULL,
        value INTEGER DEFAULT 10,
        count INTEGER DEFAULT 0,
        PRIMARY KEY (player_id, skillid)
      )
    `);
        console.log('✅ Table "player_skills" created');

        // Create news table
        await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        date BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Table "news" created');

        // Create news_comments table
        await client.query(`
      CREATE TABLE IF NOT EXISTS news_comments (
        id SERIAL PRIMARY KEY,
        news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
        author VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        date BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Table "news_comments" created');

        // Create guilds table
        await client.query(`
      CREATE TABLE IF NOT EXISTS guilds (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        ownerid INTEGER NOT NULL,
        creationdata INTEGER NOT NULL,
        motd VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Table "guilds" created');

        // Create sample characters for each vocation
        const sampleExists = await client.query(`SELECT id FROM players WHERE name = 'Pokemon Trainer Sample'`);

        if (sampleExists.rows.length === 0) {
            // Create a system account for samples
            const systemAccount = await client.query(`
        INSERT INTO accounts (name, password, email, nickname, premdays)
        VALUES ('SYSTEM', 'none', 'system@pokeelite.com', 'System', 999)
        ON CONFLICT (name) DO NOTHING
        RETURNING id
      `);

            if (systemAccount.rows.length > 0) {
                const accountId = systemAccount.rows[0].id;

                await client.query(`
          INSERT INTO players (account_id, name, world_id, sex, vocation, level, health, healthmax, mana, manamax, town_id)
          VALUES ($1, 'Pokemon Trainer Sample', 0, 0, 1, 8, 185, 185, 35, 35, 1)
        `, [accountId]);

                console.log('✅ Sample character created');
            }
        }

        // Insert sample news
        const newsExists = await client.query(`SELECT id FROM news LIMIT 1`);
        if (newsExists.rows.length === 0) {
            await client.query(`
        INSERT INTO news (title, body, author, date)
        VALUES 
          ('Welcome to PokeElite!', 'Welcome to our Pokémon server! Create your account and start your adventure!', 'Admin', ${Date.now()}),
          ('Server Updates', 'Check out the latest updates and improvements to the server.', 'Admin', ${Date.now() - 86400000})
      `);
            console.log('✅ Sample news created');
        }

        console.log('✨ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

createTables();
