const crypto = require('crypto');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.batchID = data.batchID;
    this.farmerID = data.farmerID;
    this.location = data.location;
    this.temperature = data.temperature;
    this.quantity = data.quantity;
    this.handlerRole = data.handlerRole;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.timestamp +
        this.batchID +
        this.farmerID +
        this.location +
        this.temperature +
        this.quantity +
        this.handlerRole +
        this.previousHash
      )
      .digest('hex');
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), {
      batchID: 'GENESIS',
      farmerID: 'SYSTEM',
      location: 'Origin',
      temperature: 0,
      quantity: 0,
      handlerRole: 'System'
    }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      data,
      this.getLatestBlock().hash
    );
    this.chain.push(newBlock);
    return newBlock;
  }

  validateChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return { 
          valid: false, 
          error: `Block ${i} has been tampered with`,
          tampered_block_index: i,
          tampered_block: currentBlock
        };
      }

      // Verify chain linkage
      if (currentBlock.previousHash !== previousBlock.hash) {
        return { 
          valid: false, 
          error: `Chain broken at block ${i}`,
          tampered_block_index: i,
          tampered_block: currentBlock
        };
      }
    }
    return { 
      valid: true, 
      error: null,
      tampered_block_index: null,
      message: 'All blocks verified successfully',
      total_blocks: this.chain.length
    };
  }

  detectTampering() {
    const validation = this.validateChain();
    if (!validation.valid) {
      return {
        tampered: true,
        message: validation.error,
        tampered_block_index: validation.tampered_block_index,
        tampered_block: validation.tampered_block,
        timestamp: Date.now(),
        severity: 'CRITICAL'
      };
    }
    return { 
      tampered: false, 
      message: 'Chain integrity verified',
      total_blocks_verified: this.chain.length,
      timestamp: Date.now()
    };
  }

  blockchainExplorer() {
    return this.chain.map(block => ({
      index: block.index,
      timestamp: new Date(block.timestamp).toISOString(),
      batchID: block.batchID,
      farmerID: block.farmerID,
      location: block.location,
      temperature: block.temperature,
      quantity: block.quantity,
      handlerRole: block.handlerRole,
      hash: block.hash,
      previousHash: block.previousHash
    }));
  }

  getBlockByBatchID(batchID) {
    return this.chain.filter(block => block.batchID === batchID);
  }
}

module.exports = { Blockchain, Block };
