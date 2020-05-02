import { Transaction, blockchainWallet } from '../wallet';
import { MESSAGE } from '../service/p2p';
/* eslint-disable indent */
class Miner {
    constructor(blockchain, p2pservice, wallet) {
        this.blockchain = blockchain;
        this.p2pservice = p2pservice;
        this.wallet = wallet;
    }

    mine() {
        const { blockchain: { memoryPool }, wallet, p2pservice } = this;
        /*
        5 broadcast wipe message to every node
        */
        if (memoryPool.transactions.length === 0) {
            throw Error('There are not unconfirmed transactions');
        }
        memoryPool.transactions.push(Transaction.reward(wallet, blockchainWallet));
        const block = this.blockchain.addBlock(memoryPool.transactions);
        p2pservice.sync();
        memoryPool.wipe();
        p2pservice.broadcast(MESSAGE.WIPE);

        return block;
    }
}

export default Miner;
