import mongoose from 'mongoose';

/**
 * Safely resolves a MongoDB collection from Payload's db adapter.
 * Handles both Mongoose connection and raw MongoDB db instances without nested ternaries.
 */
export function getMongoCollection(db: unknown, collectionName: string) {
  const conn = (db as any)?.connection;
  if (conn && typeof conn.collection === 'function') {
    return conn.collection(collectionName);
  }
  if (conn?.db && typeof conn.db.collection === 'function') {
    return conn.db.collection(collectionName);
  }
  return (db as any)?.collections?.[collectionName];
}

/**
 * Safely creates a MongoDB ObjectId from a 24-character string representation.
 */
export function toMongoObjectId(db: unknown, idString: string) {
  try {
    const conn = (db as any)?.connection;
    const ObjectId =
      conn?.constructor?.Types?.ObjectId || mongoose.Types.ObjectId;
    if (ObjectId && typeof ObjectId.isValid === 'function') {
      if (ObjectId.isValid(idString)) {
        return new ObjectId(idString);
      }
    } else if (ObjectId) {
      return new ObjectId(idString);
    }
  } catch {
    // Ignore invalid ObjectId conversions
  }
  return null;
}
