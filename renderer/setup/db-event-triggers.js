const pgp = require('pg-promise')();
const db = pgp(process.env.DATABASE_URL);

async function createTriggerFunction() {
    try {
        const sql = `
        CREATE FUNCTION message_changes_notify() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
        DECLARE
          payload JSONB;
        BEGIN
          IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
            payload = json_build_object(
              'type', TG_OP,
              'table', TG_TABLE_NAME,
              'data', NEW
            );
            PERFORM pg_notify('ably_messages', payload::text);
          END IF;
          RETURN NEW;
        END;
        $$; LANGUAGE plpgsql;
    `;
        await db.none(sql);
        console.log('Trigger function created successfully');
    } catch (err) {
        console.error('Error creating trigger function:', err);
    } finally {
        pgp.end();
    }
}

module.exports = createTriggerFunction;
