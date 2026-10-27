import mysql from "mysql2/promise";

// In-memory fallback if MySQL is unreachable or not configured
let inMemoryEscrows = [];
let inMemoryEvents = [];
let nextEscrowId = 1;
let nextEventId = 1;

// In-memory users storage (for dev fallback)
let inMemoryUsers = [];
let nextUserId = 1;

let pool = null;
let tablesInitialized = false;

function parseDbConfig() {
  const url = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.SPRING_DATASOURCE_URL;
  const user = process.env.MYSQL_USER || process.env.DB_USER || process.env.SPRING_DATASOURCE_USERNAME || "avnadmin";
  const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || process.env.SPRING_DATASOURCE_PASSWORD || "";

  if (!url) return null;

  // Handle jdbc:mysql:// or jdbc:mariadb:// URLs
  const cleanUrl = url.replace(/^jdbc:/i, "");

  try {
    const parsed = new URL(cleanUrl);
    return {
      host: parsed.hostname,
      port: Number(parsed.port) || 3306,
      user: decodeURIComponent(parsed.username || user),
      password: decodeURIComponent(parsed.password || password),
      database: parsed.pathname.replace(/^\//, "") || "defaultdb",
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    };
  } catch {
    return null;
  }
}

async function getPool() {
  if (pool) return pool;
  const config = parseDbConfig();
  if (!config) return null;

  try {
    pool = mysql.createPool(config);
    return pool;
  } catch (err) {
    console.warn("[DB] Failed to create MySQL pool, falling back to memory:", err.message);
    return null;
  }
}

async function initTables(p) {
  if (tablesInitialized || !p) return;
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL,
        username VARCHAR(64) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        buyer_id VARCHAR(64) UNIQUE NOT NULL,
        seller_id VARCHAR(64) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS escrows (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        buyer_address VARCHAR(512),
        seller_address VARCHAR(512),
        amount DECIMAL(19, 4),
        description TEXT,
        status VARCHAR(50),
        contract_address VARCHAR(512),
        tx_hash VARCHAR(512),
        on_chain_synced BOOLEAN DEFAULT FALSE,
        inspection_criteria TEXT,
        inspection_window VARCHAR(64),
        proof_of_delivery TEXT,
        deliverable_link TEXT,
        ai_verification_result TEXT,
        invite_token VARCHAR(64) UNIQUE,
        seller_joined BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS escrow_events (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        escrow_id BIGINT,
        event_type VARCHAR(64),
        actor_address VARCHAR(512),
        tx_hash VARCHAR(512),
        note TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    tablesInitialized = true;
  } catch (err) {
    console.warn("[DB] Table init warning:", err.message);
  }
}

function rowToEscrow(r) {
  if (!r) return null;
  let aiResult = null;
  try { aiResult = r.ai_verification_result ? JSON.parse(r.ai_verification_result) : null; } catch {}
  return {
    id: Number(r.id),
    buyerAddress: r.buyer_address,
    sellerAddress: r.seller_address,
    amount: Number(r.amount),
    description: r.description,
    status: r.status,
    contractAddress: r.contract_address,
    txHash: r.tx_hash,
    onChainSynced: Boolean(r.on_chain_synced),
    inspectionCriteria: r.inspection_criteria || null,
    inspectionWindow: r.inspection_window || "72 Hours",
    proofOfDelivery: r.proof_of_delivery || null,
    deliverableLink: r.deliverable_link || null,
    aiVerificationResult: aiResult,
    inviteToken: r.invite_token || null,
    sellerJoined: Boolean(r.seller_joined),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  };
}

function rowToEvent(r) {
  if (!r) return null;
  return {
    id: Number(r.id),
    escrowId: Number(r.escrow_id),
    eventType: r.event_type,
    actorAddress: r.actor_address,
    txHash: r.tx_hash,
    note: r.note,
    timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
  };
}

export async function getAllEscrows() {
  const p = await getPool();
  if (p) {
    try {
      await initTables(p);
      const [rows] = await p.query("SELECT * FROM escrows ORDER BY id DESC");
      return rows.map(rowToEscrow);
    } catch (err) {
      console.warn("[DB] Query failed, using memory:", err.message);
    }
  }
  return [...inMemoryEscrows].reverse();
}

export async function getEscrowById(id) {
  const numId = Number(id);
  const p = await getPool();
  if (p) {
    try {
      await initTables(p);
      const [rows] = await p.query("SELECT * FROM escrows WHERE id = ?", [numId]);
      if (rows.length > 0) return rowToEscrow(rows[0]);
    } catch (err) {
      console.warn("[DB] Query failed, using memory:", err.message);
    }
  }
  return inMemoryEscrows.find(e => e.id === numId) || null;
}

export async function createEscrow(data) {
  const hasTx = Boolean(data.txHash);
  const status = hasTx ? "FUNDED" : "CREATED";
  const onChainSynced = hasTx;
  const now = new Date().toISOString();

  const p = await getPool();
  if (p) {
    try {
      await initTables(p);
      const [result] = await p.query(
        `INSERT INTO escrows (buyer_address, seller_address, amount, description, status, contract_address, tx_hash, on_chain_synced, inspection_criteria, inspection_window, proof_of_delivery, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.buyerAddress,
          data.sellerAddress,
          data.amount,
          data.description,
          status,
          data.contractAddress || null,
          data.txHash || null,
          onChainSynced,
          data.inspectionCriteria || null,
          data.inspectionWindow || "72 Hours",
          data.proofOfDelivery || null
        ]
      );
      const id = result.insertId;
      await logEvent(id, "CREATED", data.buyerAddress, data.txHash, `Escrow created for ${data.description}`);
      return getEscrowById(id);
    } catch (err) {
      console.warn("[DB] Insert failed, using memory:", err.message);
    }
  }

  const newEscrow = {
    id: nextEscrowId++,
    buyerAddress: data.buyerAddress,
    sellerAddress: data.sellerAddress,
    amount: Number(data.amount),
    description: data.description,
    status,
    contractAddress: data.contractAddress || null,
    txHash: data.txHash || null,
    onChainSynced,
    inspectionCriteria: data.inspectionCriteria || null,
    inspectionWindow: data.inspectionWindow || "72 Hours",
    proofOfDelivery: data.proofOfDelivery || null,
    deliverableLink: null,
    aiVerificationResult: null,
    inviteToken: data.inviteToken || null,
    sellerJoined: false,
    createdAt: now,
  };
  inMemoryEscrows.push(newEscrow);
  await logEvent(newEscrow.id, "CREATED", data.buyerAddress, data.txHash, `Escrow created for ${data.description}`);
  return newEscrow;
}

// Update arbitrary fields on an escrow (used by AI verification & invite acceptance)
export async function updateEscrowField(id, fields) {
  const numId = Number(id);
  const p = await getPool();

  // Build column mappings from camelCase field names to snake_case DB columns
  const colMap = {
    deliverableLink: "deliverable_link",
    aiVerificationResult: "ai_verification_result",
    status: "status",
    sellerAddress: "seller_address",
    sellerJoined: "seller_joined",
    inviteToken: "invite_token",
  };

  if (p) {
    try {
      await initTables(p);
      const setClauses = [];
      const values = [];
      for (const [key, val] of Object.entries(fields)) {
        const col = colMap[key];
        if (col) {
          setClauses.push(`${col} = ?`);
          values.push(val);
        }
      }
      if (setClauses.length > 0) {
        values.push(numId);
        await p.query(`UPDATE escrows SET ${setClauses.join(", ")} WHERE id = ?`, values);
      }
      return getEscrowById(numId);
    } catch (err) {
      console.warn("[DB] updateEscrowField failed, using memory:", err.message);
    }
  }

  const escrow = inMemoryEscrows.find(e => e.id === numId);
  if (escrow) Object.assign(escrow, fields);
  return escrow;
}

// Find escrow by invite token (for seller joining flow)
export async function getEscrowByInviteToken(token) {
  const p = await getPool();
  if (p) {
    try {
      await initTables(p);
      const [rows] = await p.query("SELECT * FROM escrows WHERE invite_token = ?", [token]);
      if (rows.length > 0) return rowToEscrow(rows[0]);
    } catch (err) {
      console.warn("[DB] getEscrowByInviteToken failed, using memory:", err.message);
    }
  }
  return inMemoryEscrows.find(e => e.inviteToken === token) || null;
}

export async function updateEscrowStatus(id, newStatus, actorAddress) {
  const numId = Number(id);
  const p = await getPool();
  if (p) {
    try {
      await initTables(p);
      await p.query("UPDATE escrows SET status = ? WHERE id = ?", [newStatus, numId]);
      await logEvent(numId, newStatus, actorAddress, null, `Status changed to ${newStatus}`);
      return getEscrowById(numId);
    } catch (err) {
      console.warn("[DB] Update failed, using memory:", err.message);
    }
  }

  const escrow = inMemoryEscrows.find(e => e.id === numId);
  if (escrow) {
    escrow.status = newStatus;
    await logEvent(numId, newStatus, actorAddress, null, `Status changed to ${newStatus}`);
  }
  return escrow;
}

export async function syncOnChain(id, contractAddress, txHash, status) {
  const numId = Number(id);
  const p = await getPool();
  if (p) {
    try {
      await initTables(p);
      await p.query(
        `UPDATE escrows SET contract_address = COALESCE(?, contract_address), tx_hash = COALESCE(?, tx_hash), status = COALESCE(?, status), on_chain_synced = TRUE WHERE id = ?`,
        [contractAddress || null, txHash || null, status || null, numId]
      );
      if (txHash) {
        await logEvent(numId, "SYNC", null, txHash, `Synced on-chain: tx ${txHash}`);
      }
      return getEscrowById(numId);
    } catch (err) {
      console.warn("[DB] Sync failed, using memory:", err.message);
    }
  }

  const escrow = inMemoryEscrows.find(e => e.id === numId);
  if (escrow) {
    if (contractAddress) escrow.contractAddress = contractAddress;
    if (txHash) escrow.txHash = txHash;
    if (status) escrow.status = status;
    escrow.onChainSynced = true;
    if (txHash) await logEvent(numId, "SYNC", null, txHash, `Synced on-chain: tx ${txHash}`);
  }
  return escrow;
}

export async function raiseDispute(id, raisedBy, reason) {
  const numId = Number(id);
  const note = reason || `Dispute raised by ${raisedBy}`;
  const p = await getPool();
  if (p) {
    try {
      await initTables(p);
      await p.query("UPDATE escrows SET status = 'DISPUTED' WHERE id = ?", [numId]);
      await logEvent(numId, "DISPUTED", raisedBy, null, note);
      return getEscrowById(numId);
    } catch (err) {
      console.warn("[DB] Dispute failed, using memory:", err.message);
    }
  }

  const escrow = inMemoryEscrows.find(e => e.id === numId);
  if (escrow) {
    escrow.status = "DISPUTED";
    await logEvent(numId, "DISPUTED", raisedBy, null, note);
  }
  return escrow;
}

export async function resolveDispute(id, resolution, resolverAddress, note) {
  const numId = Number(id);
  const eventNote = note || `Dispute resolved as ${resolution} by ${resolverAddress}`;
  const p = await getPool();
  if (p) {
    try {
      await initTables(p);
      await p.query("UPDATE escrows SET status = ? WHERE id = ?", [resolution, numId]);
      await logEvent(numId, resolution, resolverAddress, null, eventNote);
      return getEscrowById(numId);
    } catch (err) {
      console.warn("[DB] Resolve failed, using memory:", err.message);
    }
  }

  const escrow = inMemoryEscrows.find(e => e.id === numId);
  if (escrow) {
    escrow.status = resolution;
    await logEvent(numId, resolution, resolverAddress, null, eventNote);
  }
  return escrow;
}

export async function logEvent(escrowId, eventType, actorAddress, txHash, note) {
  const numId = Number(escrowId);
  const p = await getPool();
  if (p) {
    try {
      await p.query(
        `INSERT INTO escrow_events (escrow_id, event_type, actor_address, tx_hash, note, timestamp)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [numId, eventType, actorAddress || null, txHash || null, note || null]
      );
      return;
    } catch (err) {
      console.warn("[DB] logEvent failed, using memory:", err.message);
    }
  }

  inMemoryEvents.push({
    id: nextEventId++,
    escrowId: numId,
    eventType,
    actorAddress: actorAddress || null,
    txHash: txHash || null,
    note: note || null,
    timestamp: new Date().toISOString(),
  });
}

export async function getEvents(escrowId) {
  const numId = Number(escrowId);
  const p = await getPool();
  if (p) {
    try {
      await initTables(p);
      const [rows] = await p.query("SELECT * FROM escrow_events WHERE escrow_id = ? ORDER BY id ASC", [numId]);
      return rows.map(rowToEvent);
    } catch (err) {
      console.warn("[DB] getEvents failed, using memory:", err.message);
    }
  }
  return inMemoryEvents.filter(e => e.escrowId === numId);
}

function rowToUser(r) {
  if (!r) return null;
  return {
    id: Number(r.id),
    userId: r.user_id,
    username: r.username || (r.email ? r.email.split("@")[0] : null),
    email: r.email,
    passwordHash: r.password_hash,
    fullName: r.full_name,
    buyerId: r.buyer_id,
    sellerId: r.seller_id,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function findUserByEmailOrId(identifier) {
  const cleanId = identifier.trim().toLowerCase();
  const p = await getPool();
  if (p) {
    try {
      await initTables(p);
      const [rows] = await p.query(
        "SELECT * FROM users WHERE email = ? OR user_id = ? OR username = ?",
        [cleanId, cleanId, cleanId]
      );
      if (rows.length > 0) return rowToUser(rows[0]);
    } catch (err) {
      console.warn("[DB] findUserByEmailOrId failed, using memory:", err.message);
    }
  }
  return inMemoryUsers.find(
    u => u.email.toLowerCase() === cleanId || 
         u.userId.toLowerCase() === cleanId || 
         (u.username && u.username.toLowerCase() === cleanId)
  ) || null;
}

export async function createUser(userData) {
  const { userId, username, email, passwordHash, fullName, buyerId, sellerId } = userData;
  const cleanUsername = username?.trim().toLowerCase() || email.split("@")[0].toLowerCase();
  const p = await getPool();
  if (p) {
    try {
      await initTables(p);
      const [result] = await p.query(
        `INSERT INTO users (user_id, username, email, password_hash, full_name, buyer_id, seller_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [userId, cleanUsername, email, passwordHash, fullName || null, buyerId, sellerId]
      );
      const id = result.insertId;
      return findUserByEmailOrId(userId);
    } catch (err) {
      console.warn("[DB] createUser failed, using memory:", err.message);
    }
  }

  const newUser = {
    id: nextUserId++,
    userId,
    username: cleanUsername,
    email,
    passwordHash,
    fullName: fullName || null,
    buyerId,
    sellerId,
    createdAt: new Date().toISOString(),
  };
  inMemoryUsers.push(newUser);
  return newUser;
}
