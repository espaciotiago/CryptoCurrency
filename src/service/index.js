import express from 'express';
import bodyParser from 'body-parser';

import Blockchain from '../blockchain';
import Wallet from '../wallet';
import Miner from '../miner';
import P2PService, { MESSAGE } from './p2p';

const { HTTP_PORT = 3000 } = process.env;

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet(blockchain);
const walletMiner = new Wallet(blockchain, 0);
const p2pService = new P2PService(blockchain);
const miner = new Miner(blockchain, p2pService, walletMiner);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
  res.json(blockchain.blocks);
});

app.post('/wallet', (req, res) => {
  const { publicKey } = new Wallet(blockchain);
  res.json({ publicKey });
});

app.get('/transactions', (req, res) => {
  const { memoryPool: { transactions } } = blockchain;
  res.json(transactions);
});

app.post('/transaction', (req, res) => {
  const { body: { recipient, amount } } = req;
  try {
    const transaction = wallet.createTransaction(recipient, amount);
    p2pService.broadcast(MESSAGE.TX, transaction);
    res.json(transaction);
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get('/mine/transactions', (req, res) => {
  try {
    miner.mine();
    res.redirect('/blocks');
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.listen(HTTP_PORT, () => {
  console.log(`Service HTTP:${HTTP_PORT} listening...`);
  p2pService.listen();
});
